const assert = require("assert");
const expect = require("chai").expect;
const request = require("supertest");
const sinon = require("sinon");
const app = require("../ExpressFunctionApp/app");

const getSleep = require("../ExpressFunctionApp/routes/getSleep");

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

describe('ALL /api/echo/:status?', () => {

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

  it('should return query strings in echo-qs object', () => {
    return request(app)
      .get('/api/echo?abc=def&ghi=jkl')
      .then((response) => {
        expect(response.body['echo-qs']['abc']).to.eql('def');
        expect(response.body['echo-qs']['ghi']).to.eql('jkl');
      })
  });

  ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].forEach((method) => {
    it('should return ' + method + ' method in echo-method key', () => {
      return request(app)
        [method.toLowerCase()]('/api/echo')
        .then((response) => {
          expect(response.body['echo-method']).to.eql(method);
        })
    });
  });


  it('should return json request body in echo-body object', () => {
    return request(app)
      .post('/api/echo')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'key1': 'value1', 'key2': 'value2'})
      .then((response) => {
        expect(response.body['echo-body-content-type']).to.include('application/vnd.api+json');
        expect(response.body['echo-body']).to.eql({'key1': 'value1', 'key2': 'value2'});
      })
  });

  it('should return 400 status for malformed json request body', () => {
    return request(app)
      .post('/api/echo')
      .set('Content-Type', 'application/vnd.api+json')
      .send('{"key1":}')
      .then((response) => {
        expect(response.body['error']['body']).to.eql('{\"key1\":}');
      })
  });

  [200, 400, 401, 403, 404, 405, 410, 500, 502, 503, 504].forEach((status) => {
    it('should return ' + status + ' status if supplied in route parameter', () => {
      return request(app)
        .post('/api/echo/' + status.toString())
        .then((response) => {
          expect(response.status).to.eql(status);
        })
    });
  });
});

describe('GET /api/files/errors/:status', () => {
  [200, 400, 401, 403, 404, 405, 410, 500, 502, 503, 504].forEach((status) => {
    it('should return ' + status + ' status supplied in route parameter', () => {
      return request(app)
        .get('/api/files/errors/' + status.toString())
        .then((response) => {
          expect(response.status).to.eql(status);
        })
    });
  });
});

describe('POST /api/all-types', () => {

  it('should return request headers in inputs object, downcased keys', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .set('Custom-Echo-Header', 'Random-Value-123')
      .set('Another-Echo-Header', 'My value 456')
      .then((response) => {
        expect(response.body['inputs']['headers']['custom-echo-header']).to.eql('Random-Value-123');
        expect(response.body['inputs']['headers']['another-echo-header']).to.eql('My value 456');
      })
  });

  it('should return request body in outputs object', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'any': {'key1': 'value1'}})
      .then((response) => {
        expect(response.body['inputs']['body']).to.eql({'any': {'key1': 'value1'}});
      })
  });

  it('should return json response', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send()
      .then((response) => {
        expect(response.headers['content-type']).to.include('application/json');
      })
  });  

  it('should return text output', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'textInput': 'abc'}})
      .then((response) => {
        expect(response.body['outputs']['textOutput']).to.eql('abc')
      })
  });

  it('should return empty string for empty text input', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'textInput': ''}})
      .then((response) => {
        expect(response.body['outputs']['textOutput']).to.eql('')
      })
  });

  it('should return null for null text input', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'textInput': null}})
      .then((response) => {
        expect(response.body['outputs']['textOutput']).to.eql(null)
      })
  });

  it('should return decimal output', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'decimalInput': 123.45}})
      .then((response) => {
        expect(response.body['outputs']['decimalOutput']).to.eql(123.45)
      })
  });

  it('should not add decimal points for round decimal input', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'decimalInput': 42}})
      .then((response) => {
        expect(response.body['outputs']['decimalOutput']).to.eql(42)
      })
  });

  it('should return null for null decimal input', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'decimalInput': null}})
      .then((response) => {
        expect(response.body['outputs']['decimalOutput']).to.eql(null)
      })
  });

  it('should return integer output', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'integerInput': -789}})
      .then((response) => {
        expect(response.body['outputs']['integerOutput']).to.eql(-789)
      })
  });

  it('should preserve decimals if sent for integer input', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'integerInput': 67.89}})
      .then((response) => {
        expect(response.body['outputs']['integerOutput']).to.eql(67.89)
      })
  });

  it('should return null for null integer input', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'integerInput': null}})
      .then((response) => {
        expect(response.body['outputs']['integerOutput']).to.eql(null)
      })
  });

  it('should return true boolean output', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'booleanInput': true}})
      .then((response) => {
        expect(response.body['outputs']['booleanOutput']).to.eql(true)
      })
  });

  it('should return false boolean output', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'booleanInput': false}})
      .then((response) => {
        expect(response.body['outputs']['booleanOutput']).to.eql(false)
      })
  });

  it('should return null for null boolean input', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'booleanInput': null}})
      .then((response) => {
        expect(response.body['outputs']['booleanOutput']).to.eql(null)
      })
  });

  it('should return null for incorrect boolean input', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'booleanInput': 'true'}})
      .then((response) => {
        expect(response.body['outputs']['booleanOutput']).to.eql(null)
      })
  });

  it('should return datetime output with ISO 8601 Z format', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'datetimeInput': '2017-07-21T17:32:28Z'}})
      .then((response) => {
        expect(response.body['outputs']['datetimeOutput']).to.eql('2017-07-21T17:32:28Z')
      })
  });

  it('should return datetime output with ISO 8601 and time offset format', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'datetimeInput': '2017-07-21T17:32:28+0800'}})
      .then((response) => {
        expect(response.body['outputs']['datetimeOutput']).to.eql('2017-07-21T17:32:28+0800')
      })
  });

  it('should return null for null datetime input', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'datetimeInput': null}})
      .then((response) => {
        expect(response.body['outputs']['datetimeOutput']).to.eql(null)
      })
  });

  it('should return collection output', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'collectionInput': ['abc', 'def', 'ghi']}})
      .then((response) => {
        expect(response.body['outputs']['collectionOutput']).to.eql(['abc', 'def', 'ghi'])
      })
  });

  it('should return empty collection for empty collection input', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'collectionInput': []}})
      .then((response) => {
        expect(response.body['outputs']['collectionOutput']).to.eql([])
      })
  });

  it('should return null for non-collection input', () => {
    return request(app)
      .post('/api/all-types')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'allTypesInputs': {'collectionInput': 'abc'}})
      .then((response) => {
        expect(response.body['outputs']['collectionOutput']).to.eql(null)
      })
  });
});

describe('POST /api/all-parameter-types/:string_path/:integer_path/:boolean_path', () => {
  
  it('should return all parameters in output', () => {
    return request(app)
      .post('/api/all-parameter-types/something/777/true?string_query=mystringquery&integer_query=666&boolean_query=true')
      .set('Content-Type', 'application/vnd.api+json')
      .set('string_header', 'this is a string header')
      .set('integer_header', '555')
      .set('boolean_header', 'true')
      .send({'string_body': 'this is a string property'})
      .then((response) => {
        expect(response.status).to.eql(200);
        expect(response.body['allParameterTypesOutput']["querystring"])
          .to.eql({'string_query': 'mystringquery', 'integer_query': '666', 'boolean_query': 'true'});
        expect(response.body['allParameterTypesOutput']["headers"]["string_header"])
          .to.eql('this is a string header');
        expect(response.body['allParameterTypesOutput']["headers"]["integer_header"])
          .to.eql('555');
        expect(response.body['allParameterTypesOutput']["headers"]["boolean_header"])
          .to.eql('true');
        expect(response.body['allParameterTypesOutput']["path"]["string-path"])
          .to.eql('something');
        expect(response.body['allParameterTypesOutput']["path"]["integer-path"])
          .to.eql('777');
        expect(response.body['allParameterTypesOutput']["path"]["boolean-path"])
          .to.eql('true');
        expect(response.body['allParameterTypesOutput']['body']['string_body'])
          .to.eql('this is a string property');
      })
  });
});

describe('GET /api/sleep', () => {

  let clock = null;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  }); 

  it('should send OK after 75000 milliseconds', () => {
    const req = {};
    const res = {};

    res.send = sinon.spy();

    getSleep(req, res);
    expect(res.send.called).to.be.eql(false);

    clock.tick(70000);
    expect(res.send.called).to.eql(false);

    clock.tick(5000);
    expect(res.send.calledWith({"message": "OK"})).to.eql(true);
  });
});
