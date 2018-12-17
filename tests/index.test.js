const assert = require("assert");
const expect = require("chai").expect;
const request = require("supertest");
const app = require("../ExpressFunctionApp/app");


describe('Unit testing the /api/:foo route', function() {

  it('should return 200 status', function() {
    return request(app)
      .get('/api/foo')
      .then(function(response){
          assert.equal(response.status, 200)
      })
  });

  it('should return json response', function() {
    return request(app)
      .get('/api/foo')
      .then(function(response){
          assert.deepEqual(response.body, {"foo": "foo"})
      })
  });

});

describe('Unit testing the /api/:foo/:bar route', function() {

  it('should return 200 status', function() {
    return request(app)
      .get('/api/foo/bar')
      .then(function(response){
          assert.equal(response.status, 200)
      })
  });

  it('should return json response', function() {
    return request(app)
      .get('/api/foo/bar')
      .then(function(response){
          assert.deepEqual(response.body, {"foo": "foo", "bar": "bar"})
      })
  });

});
