const assert = require("assert");
const expect = require("chai").expect;
const request = require("supertest");
const app = require("../ExpressFunctionApp/app");


describe('/api/hello', () => {

  it('should return 200 status', () => {
    return request(app)
      .get('/api/hello')
      .then(function(response){
        assert.equal(response.status, 200)
      })
  });

  it('should return json response', () => {
    return request(app)
      .get('/api/hello')
      .then(function(response){
        assert.deepEqual(response.body, {"hello": "world"})
      })
  });

});


describe('/api/docs/', () => {

  it('should return 200 status for existing file', () => {
    return request(app)
      .get('/api/docs/swagger.json')
      .then(function(response){
        assert.equal(response.status, 200)
      })
  });

  it('should return 404 status for non-existing file', () => {
    return request(app)
      .get('/api/docs/doesnexist.json')
      .then(function(response){
        assert.equal(response.status, 404)
      })
  });

});

