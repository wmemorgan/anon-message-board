/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;

const messageHandler = require('../controllers/messageHandler')

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post(messageHandler.addThread)
    .get(messageHandler.listThreads)
    .put(messageHandler.reportThread)
    .delete(messageHandler.deleteThread)
    
  app.route('/api/replies/:board')
    .post(messageHandler.addReply)
    .get(messageHandler.displayThread)
    .put(messageHandler.reportReply)
    .delete(messageHandler.deleteReply)

};
