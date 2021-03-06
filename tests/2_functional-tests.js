/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var expect = require('chai').expect

chai.use(chaiHttp);
const TEST_BOARD = 'TestBoard'
const TEST_PWD = 'pwd'

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('create thread', function(done) {
        chai.request(server)
          .post(`/api/threads/${TEST_BOARD}`)
          .send({
            board: TEST_BOARD,
            text: 'Welcome to the Test Board',
            delete_password: TEST_PWD
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            expect(res).to.redirect
            done()
          })
      })
      
    });
    
    suite('GET', function() {
      test('list threads', function(done) {
        chai.request(server)
          .get(`/api/threads/${TEST_BOARD}`)
          .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.isArray(res.body, 'response should be an array')
            assert.property(res.body[0], '_id', 'threads in array should contain _id')
            assert.property(res.body[0], 'text', 'threads in array should contain text')
            assert.property(res.body[0], 'created_on', 'threads in array should contain created_on field')
            assert.property(res.body[0], 'bumped_on', 'threads in array should contain bumped_on field')
            assert.isArray(res.body[0].replies, 'response should be an array')
            TEST_ID = res.body[0]._id
            done()
          })
      })

    });

    suite('PUT', function () {
      test('report thread', function(done) {
        chai.request(server)
        .put(`/api/threads/${TEST_ID}`)
        .send({
          report_id: TEST_ID,
          reported: true
        })
        .end(function(err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.text, 'success')
          done()
        })
      })

    });

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('Add reply to thread', function(done) {
        chai.request(server)
          .post(`/api/replies/${TEST_BOARD}`)
          .send({
            thread_id: TEST_ID,
            text: 'Hello, happy to be here!',
            delete_password: TEST_PWD
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            expect(res).to.redirect
            done()
          })
      })
    });
    
    suite('GET', function() {
      test('Display thread details', function(done) {
        chai.request(server)
          .get(`/api/replies/${TEST_BOARD}`)
          .query({thread_id: TEST_ID})
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.property(res.body, '_id', 'threads in array should contain _id')
            assert.property(res.body, 'text', 'threads in array should contain text')
            assert.property(res.body, 'created_on', 'threads in array should contain created_on field')
            assert.property(res.body, 'bumped_on', 'threads in array should contain bumped_on field')
            assert.isArray(res.body.replies, 'response should be an array')
            TEST_REPLY_ID = res.body.replies[0]._id
            done()
          })
      })
    });
    
    suite('PUT', function() {
      test('Report thread reply', function(done) {
        chai.request(server)
        .put(`/api/replies/${TEST_BOARD}`)
        .send({
          thread_id: TEST_ID,
          reply_id: TEST_REPLY_ID
        })
        .end(function(err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.text, 'success')
          done()
        })
      })
    });

    suite('DELETE', function () {

      test('Mark comment as [deleted]', function (done) {
        chai.request(server)
          .delete(`/api/replies/${TEST_BOARD}`)
          .send({
            thread_id: TEST_ID,
            reply_id: TEST_REPLY_ID,
            delete_password: TEST_PWD
          })
          .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')
            done()
          })

      })

      test('Delete thread', function (done) {
        chai.request(server)
          .delete(`/api/threads/${TEST_BOARD}`)
          .send({
            thread_id: TEST_ID,
            delete_password: TEST_PWD
          })
          .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')
            done()
          })
      })
    
    });
    
  });

});
