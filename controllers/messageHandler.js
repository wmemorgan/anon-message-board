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
  let { text, delete_password } = req.body
  console.log(`new text: `, text)
  let hex = /[0-9A-Fa-f]{6}/g;
  let threadId = (hex.test(req.body.thread_id)) ? ObjectId(req.body.thread_id) : req.body.thread_id;
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
      res.send(`New reply created`)
      // res.redirect(`/b/${board}/${thread}/`)
      // res.redirect(`/b/${board}/`)
    }
  })
}

// GET functions
exports.listThreads = (req, res) => {
console.log(`listThread req.params: `, req.params)
let board = req.params.board.toLowerCase()
  db.find({board})
    .toArray((err, doc) => {
      if (err) {
        console.error(err)
        res.status(500).send(err)
      }
      else {
        // Code inspired by Drinka Ľubomír https://github.com/lubodrinka/Personal-Library/blob/master/routes/api.js
        results = doc.map(d => d = { 
          "_id": d._id, 
          "text": d.text, 
          "bumped_on": d.bumped_on,
          "created_on": d.created_on,
          "replies" : d.replies,
          "replycount": d.replies.length
         })
        res.send(results)
      }
    })

}

exports.displayThread = (req, res) => {
  res.send('displayThread')
}

// PUT functions
exports.reportThread = (req, res) => {
  res.send('reportThread')
}

exports.reportReply = (req, res) => {
  res.send('reportReply')
}

//DELETE functions
exports.deleteThread = (req, res) => {
  res.send('deleteThread')
}

exports.deleteReply = (req, res) => {
  res.send('deleteReply')
}