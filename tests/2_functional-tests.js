const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  const req = () => chai.request(server);
  let id;

  test('#example Test GET /api/books', function(done){
    req().post('/api/books').type('form').send({ title: 'seed' }).end(function() {
      req().get('/api/books').end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
    });
  });

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {
      test('Test POST /api/books with title', function(done) {
        req().post('/api/books').type('form').send({ title: 'Faux Book' }).end((e, res) => {
          assert.equal(res.status, 200); assert.equal(res.body.title, 'Faux Book'); assert.property(res.body, '_id');
          id = res.body._id; done(); });
      });
      test('Test POST /api/books with no title given', function(done) {
        req().post('/api/books').type('form').send({}).end((e, res) => {
          assert.equal(res.text, 'missing required field title'); done(); });
      });
    });

    suite('GET /api/books => array of books', function(){
      test('Test GET /api/books',  function(done){
        req().get('/api/books').end((e, res) => { assert.isArray(res.body); assert.isAtLeast(res.body.length, 2); done(); });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function(){
      test('Test GET /api/books/[id] with id not in db',  function(done){
        req().get('/api/books/nope').end((e, res) => { assert.equal(res.text, 'no book exists'); done(); });
      });
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        req().get('/api/books/' + id).end((e, res) => {
          assert.equal(res.body.title, 'Faux Book'); assert.isArray(res.body.comments); done(); });
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      test('Test POST /api/books/[id] with comment', function(done){
        req().post('/api/books/' + id).type('form').send({ comment: 'nice' }).end((e, res) => {
          assert.deepEqual(res.body.comments, ['nice']); done(); });
      });
      test('Test POST /api/books/[id] without comment field', function(done){
        req().post('/api/books/' + id).type('form').send({}).end((e, res) => {
          assert.equal(res.text, 'missing required field comment'); done(); });
      });
      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        req().post('/api/books/nope').type('form').send({ comment: 'x' }).end((e, res) => {
          assert.equal(res.text, 'no book exists'); done(); });
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {
      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        req().delete('/api/books/' + id).end((e, res) => { assert.equal(res.text, 'delete successful'); done(); });
      });
      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        req().delete('/api/books/' + id).end((e, res) => { assert.equal(res.text, 'no book exists'); done(); });
      });
    });

  });

});
