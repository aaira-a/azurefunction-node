const assert = require("assert");
const expect = require("chai").expect;
const request = require("supertest");
const app = require("../ExpressFunctionApp/app");


describe('GET /api/hello', () => {

  it('should return 200 status', () => {
    return request(app)
      .get('/api/hello')
      .then((response) => {
        expect(response.status).to.eql(200)
      })
  });

  it('should return json response', () => {
    return request(app)
      .get('/api/hello')
      .then((response) => {
        expect(response.body).to.eql({"hello": "world"});
        expect(response.headers['content-type']).to.include('application/json');
      })
  });

});


describe('GET /api/docs/', () => {

  it('should return 200 status for existing file', () => {
    return request(app)
      .get('/api/docs/swagger.json')
      .then((response) => {
        expect(response.status).to.eql(200)
      })
  });

  it('should return 404 status for non-existing file', () => {
    return request(app)
      .get('/api/docs/doesnexist.json')
      .then((response) => {
        expect(response.status).to.eql(404)
      })
  });

});

describe('GET /api/echo', () => {

  it('should return 200 status', () => {
    return request(app)
      .get('/api/echo')
      .then((response) => {
        expect(response.status).to.eql(200)
      })
  });

  it('should return request headers in echo-headers object, downcased keys', () => {
    return request(app)
      .get('/api/echo')
      .set('Custom-Echo-Header', 'Random-Value-123')
      .set('Another-Echo-Header', 'My value 456')
      .then((response) => {
        expect(response.body['echo-headers']['custom-echo-header']).to.eql('Random-Value-123');
        expect(response.body['echo-headers']['another-echo-header']).to.eql('My value 456');
      })
  });

  it('should return json response', () => {
    return request(app)
      .get('/api/echo')
      .then((response) => {
        expect(response.headers['content-type']).to.include('application/json');
      })
  });

});
