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

}

exports.addReply = (req, res) => {

}

// GET functions
exports.listThreads = (req, res) => {

}

exports.displayThread = (req, res) => {

}

// PUT functions
exports.reportThread = (req, res) => {

}

exports.reportReply = (req, res) => {

}

//DELETE functions
exports.deleteThread = (req, res) => {

}

exports.deleteReply = (req, res) => {
  
}