const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DATABASE; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

let db

mongo.connect(CONNECTION_STRING, async (err, conn) => {
  if (err) throw err
  else {
    db = await conn.collection('messageBoard')
    console.log(`Successfully connected to: ${CONNECTION_STRING}`)
  }
})

// POST functions
exports.addThread = (req, res) => {
  console.log(`addThread req.params is: `, req.params)
  console.log(`addThread req.body data is: `, req.body)
  let { text, delete_password } = req.body
  let board = req.params.board.toLowerCase()
  db.insertOne(
    { board: board,
      text: text,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      delete_password: delete_password,
      replies: []
    }, (err, doc) => {
      if (err) {
        console.error(err)
        res.status(500).send(err)
      } else {
        console.log(`New thread created: `, doc.ops[0])
        res.redirect(`/b/${board}/`)
      }
  })
} 


exports.addReply = (req, res) => {
  console.log(`addReply req.params: `, req.params)
  console.log(`addReply req.query: `, req.query)
  console.log(`addReply req.body: `, req.body)
  let { board } = req.params
  let { thread_id, text, delete_password } = req.body
  console.log(`new text: `, text)
  let hex = /[0-9A-Fa-f]{6}/g;
  let threadId = (hex.test(thread_id)) ? ObjectId(thread_id) : thread_id;
  // let threadId = req.body.thread_id;
  console.log(`input id: `, threadId)
  let updates = {
    bumped_on: new Date(),
  }
  let newReply = {
    '_id': ObjectId(),
    'text': text,
    created_on: new Date(),
    reported: false,
    delete_password: delete_password,
  }
  let query = { '_id': threadId }
  let action = { $set: updates, $push: { "replies": newReply } }
  // let action = { $set: updates }
  
  db.update(query, action, (err, doc) => {
    if (err) {
      console.error(err)
      res.status(500).send('database update attempt failed')
    } else if (doc === null) {
      res.send('reply not added to thread')
    } else {
      // console.log(`Thread found: `, doc)
      console.log(`New reply created`)
      // res.send(`New reply created`)
      res.redirect(`/b/${board}/${threadId}/`)
      // res.redirect(`/b/${board}/`)
    }
  })
}

// GET functions
exports.listThreads = (req, res) => {
console.log(`listThread req.params: `, req.params)
let board = req.params.board.toLowerCase()
  db.find({board}).sort({"bumped_on" : -1, "replies.created_on": -1}).limit(10)
    .toArray((err, doc) => {
      if (err) {
        console.error(err)
        res.status(500).send(err)
      }
      else {
        // Code inspired by Drinka Ľubomír https://github.com/lubodrinka/Personal-Library/blob/master/routes/api.js
        const sortByDate = (replies) => 
          replies.sort((a, b) => {
            if(b.created_on > a.created_on) return 1
          })
        
        results = doc.map(d => d = { 
          "_id": d._id, 
          "text": d.text, 
          "bumped_on": d.bumped_on,
          "created_on": d.created_on,
          "replies": sortByDate(d.replies.slice(-3)),
          "replycount": d.replies.length
         })
        res.send(results)
      }
    })

}

exports.displayThread = (req, res) => {
  console.log(`displayThread req.params: `, req.params)
  console.log(`displayThread req.query: `, req.query)
  console.log(`displayThread req.body: `, req.body)
  let hex = /[0-9A-Fa-f]{6}/g;
  let id = (hex.test(req.query.thread_id)) ? ObjectId(req.query.thread_id) : req.query.thread_id;
  let query = { '_id': id }
  db.findOne(query, (err, doc) => {
    if (err) throw err
    else if (doc == null) {
      res.send(`no thread exists`)
    } else {
      let results = {
        _id: doc._id,
        text: doc.text,
        created_on: doc.created_on,
        bumped_on: doc.bumped_on,
        replies: doc.replies.map(d => d = { _id: d._id, text: d.text, created_on: d.created_on })
      }
      // console.log(results)
      res.json(results)
    }
  })
}

// PUT functions
exports.reportThread = (req, res) => {
  console.log(`reportThread req.params: `, req.params)
  console.log(`reportThread req.query: `, req.query)
  console.log(`reportThread req.body: `, req.body)
  let hex = /[0-9A-Fa-f]{6}/g;
  let id = (hex.test(req.body.report_id)) ? ObjectId(req.body.report_id) : req.body.report_id
  let query = { '_id': id }
  let action = { $set: { reported: true } }
  db.updateOne(query, action, (err, doc) => {
    if (err) {
      console.error(err)
      res.status(500).send(`could not update ${id}`)
    } else if (doc.result.n == 0) {
      res.send('incorrect info')
    }
    else {
      res.send('success')
    }
  })
}

exports.reportReply = (req, res) => {
  console.log(`reportReply req.params: `, req.params)
  console.log(`reportReply req.query: `, req.query)
  console.log(`reportReply req.body: `, req.body)
  let hex = /[0-9A-Fa-f]{6}/g;
  let threadId = (hex.test(req.body.thread_id)) ? ObjectId(req.body.thread_id) : req.body.thread_id
  let replyId = (hex.test(req.body.reply_id)) ? ObjectId(req.body.reply_id) : req.body.reply_id
  let query = { '_id': threadId, 'replies._id': replyId }
  console.log(`reportReply query: `, query)
  let action = { $set: { 'replies.$.reported': true } }
  console.log(`reportReply action: `, action)
  db.updateOne(query, action, (err, doc) => {
    if (err) {
      console.error(err)
      res.status(500).send(`could not update reply id: ${replyId}`)
    } else if (doc.result.n == 0) {
      res.send('incorrect info')
    }
    else {
      console.log('reportReply: success')
      res.send('success')
    }
  })
}

//DELETE functions
exports.deleteThread = (req, res) => {
  console.log(`deleteThread req.params: `, req.params)
  console.log(`deleteThread req.query: `, req.query)
  console.log(`deleteThread req.body: `, req.body)
  let hex = /[0-9A-Fa-f]{6}/g;
  let threadId = (hex.test(req.body.thread_id)) ? ObjectId(req.body.thread_id) : req.body.thread_id
  let query = { '_id': threadId, 'delete_password': req.body.delete_password }
  console.log(`query is: `, query)
  db.deleteOne(query, (err, doc) => {
    if (err) {
      console.error(err)
      res.status(500).send(`could not update reply id: ${threadId}`)
    } else if (doc.result.n == 0) {
      res.send('incorrect password')
    }
    else {
      console.log(`deleteThread: success`, doc)
      res.send(`success`)
    }
  })
}

exports.deleteReply = (req, res) => {
  console.log(`deleteReply req.params: `, req.params)
  console.log(`deleteReply req.query: `, req.query)
  console.log(`deleteReply req.body: `, req.body)
  let hex = /[0-9A-Fa-f]{6}/g;
  let threadId = (hex.test(req.body.thread_id)) ? ObjectId(req.body.thread_id) : req.body.thread_id
  let replyId = (hex.test(req.body.reply_id)) ? ObjectId(req.body.reply_id) : req.body.reply_id
  let query = { '_id': threadId, 'replies._id': replyId, 'delete_password': req.body.delete_password }
  console.log(`reportReply query: `, query)
  let action = { $set: { 'replies.$.text': '[deleted]' } }
  console.log(`reportReply action: `, action)
  db.updateOne(query, action, (err, doc) => {
    if (err) {
      console.error(err)
      res.status(500).send(`could not delete reply id: ${replyId}`)
    } else if (doc.result.n == 0 && doc.result.nModified == 0) {
      console.log(`deleteReply doc: `, doc.result)
      console.log(`incorrect password`)
      res.send(`incorrect password`)
    }
    else {
      console.log(`deleteReply doc: `, doc.result)
      console.log('deleteReply: success')
      res.send('success')
    }
  })
}