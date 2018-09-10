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
  let { text, delete_password } = req.body

  db.insertOne(
    { text: text,
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
        res.json(doc.ops[0])
      }
  })
} 


exports.addReply = (req, res) => {
  res.send(`addReply`)
}

// GET functions
exports.listThreads = (req, res) => {
  res.send('listThreads')
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