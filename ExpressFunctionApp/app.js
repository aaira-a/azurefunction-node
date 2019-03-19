const express = require("express");

const axios = require("axios");
const jsonfile = require("jsonfile");
const path = require("path");
const uuidv4 = require("uuid/v4");
const app = express();

const sleepRoute = require("./routes/sleepRoute");

app.use(express.json());
app.use(express.urlencoded());

app.get("/api/hello", (req, res) => {
  res.json({
    "hello": "world"
  })
});

app.get('/api/docs/:requestPath', (req, res) => {
  let requestPath = req.params.requestPath;
  let file = path.join(__dirname + '/docs/' + requestPath);

  jsonfile.readFile(file, (err, obj) => {
    if(err) {
      res.status(404);
    }
    res.json(obj);
  });
});

app.all('/api/echo/:status?', (req, res) => {
  let response = {};

  response["echo-method"] = req.method;
  response["echo-headers"] = req.headers;
  response["echo-qs"] = req.query;

  if (req.headers.hasOwnProperty("content-type")) {
    response["echo-body-content-type"] = req.headers["content-type"]
  }

  if (req.hasOwnProperty("body")) {
    response["echo-body"] = req.body;
  }

  if (req.params.status !== undefined) {
    res.status(req.params.status).json(response);
  }
  res.json(response);
})

app.get('/api/files/errors/:status', (req, res) => {
  res.status(req.params.status).send();
});

app.post('/api/all-types', (req, res) => {
  let response = {};

  response["inputs"] = {};
  response["inputs"]["headers"] = req.headers;
  response["inputs"]["body"] = req.body

  response["outputs"] = {};

  if (req.hasOwnProperty("body") && req["body"].hasOwnProperty("allTypesInputs")) {
    if (req.body["allTypesInputs"].hasOwnProperty("textInput")) {
      response["outputs"]["textOutput"] = req.body["allTypesInputs"]["textInput"];
    }

    if (req.body["allTypesInputs"].hasOwnProperty("decimalInput")) {
      response["outputs"]["decimalOutput"] = req.body["allTypesInputs"]["decimalInput"];
    }

    if (req.body["allTypesInputs"].hasOwnProperty("integerInput")) {
      response["outputs"]["integerOutput"] = req.body["allTypesInputs"]["integerInput"];
    }

    if (req.body["allTypesInputs"].hasOwnProperty("booleanInput")) {
      if (typeof req.body["allTypesInputs"]["booleanInput"] === 'boolean') {
        response["outputs"]["booleanOutput"] = req.body["allTypesInputs"]["booleanInput"];
      }
      else {
        response["outputs"]["booleanOutput"] = null;
      }
    }

    if (req.body["allTypesInputs"].hasOwnProperty("datetimeInput")) {
      response["outputs"]["datetimeOutput"] = req.body["allTypesInputs"]["datetimeInput"];
    }

    if (req.body["allTypesInputs"].hasOwnProperty("collectionInput")) {
      if (req.body["allTypesInputs"]["collectionInput"] instanceof Array) {
        response["outputs"]["collectionOutput"] = req.body["allTypesInputs"]["collectionInput"];
      }
      else {
        response["outputs"]["collectionOutput"] = null;
      }
    }
  }
  res.json(response);
});

app.post('/api/all-parameter-types/:string_path/:integer_path/:boolean_path', (req, res) => {
  let response = {};

  response["inputs"] = {};
  response["inputs"]["headers"] = req.headers;
  response["inputs"]["querystring"] = req.query;
  response["inputs"]["body"] = req.body;

  response["allParameterTypesOutput"] = {};
  response["allParameterTypesOutput"]["headers"] = {
    "string_header": req.headers["string_header"],
    "integer_header": req.headers["integer_header"],
    "boolean_header": req.headers["boolean_header"]
  }

  response["allParameterTypesOutput"]["path"] = {
    "string-path": req.params.string_path,
    "integer-path": req.params.integer_path,
    "boolean-path": req.params.boolean_path
  }

  response["allParameterTypesOutput"]["querystring"] = req.query;

  response["allParameterTypesOutput"]["body"] = req.body;  

  res.json(response);
});

app.post('/api/path-encoding/:text', (req, res) => {
  let response = {};

  response["inputs"] = {};
  response["inputs"]["originalUrl"] = req.originalUrl;
  response["inputs"]["headers"] = req.headers;
  response["inputs"]["body"] = req.body;

  response["path"] = req.originalUrl.replace(/.*\/api\/path-encoding\//g, '');
  res.json(response);
});

app.post('/api/query-encoding', (req, res) => {
  let response = {};

  response["inputs"] = {};
  response["inputs"]["originalUrl"] = req.originalUrl;
  response["inputs"]["headers"] = req.headers;
  response["inputs"]["body"] = req.body;

  response["query"] = req.headers["x-original-url"].replace(/.*\/api\/query-encoding\?string_query=/g, '');
  res.json(response);
});

app.post('/api/form-urlencoded/:string_path/parsed', (req, res) => {
  let response = {};

  response["inputs"] = {};
  response["inputs"]["originalUrl"] = req.originalUrl;
  response["inputs"]["headers"] = req.headers;
  response["inputs"]["body"] = req.body;

  if (req.headers.hasOwnProperty("content-type") 
      && req.headers["content-type"] === 'application/x-www-form-urlencoded') {
        response["inputs"]["x-www-form-urlencoded"] = true;
  }
  else {
    response["inputs"]["x-www-form-urlencoded"] = false;
  }

  response["outputs"] = {};
  response["outputs"]["textPathOutput"] = req.params.string_path;
  response["outputs"]["textOutput"] = req.body.string;
  response["outputs"]["decimalOutput"] = parseFloat(req.body.decimal);
  response["outputs"]["integerOutput"] = parseInt(req.body.integer);

  if (req.body.boolean === 'true') {
    response["outputs"]["booleanOutput"] = true;
  }

  else if (req.body.boolean === 'false') {
    response["outputs"]["booleanOutput"] = false;
  }

  else {
    response["outputs"]["booleanOutput"] = 'error'
  }

  response["outputs"]["datetimeOutput"] = req.body.datetime;


  res.json(response);
});

function callCallbackUrl(payload) {
  const urlToCall = payload["outputs"]["callbackUrl"];

  setTimeout(() => {
    axios.post(urlToCall, payload)
      .then((response) => {
        console.log(response.data.status);
      })
      .catch((error) => {
        console.log(error);
    })
  }, 15000);
}

app.post('/api/async-callback', (req, res) => {
  let response = {};
  
  response["receiptId"] = uuidv4();
  
  response["inputs"] = {};
  response["inputs"]["headers"] = req.headers;
  response["inputs"]["body"] = req.body;

  let baseCallbackUrl = decodeURI(req.query["callbackUrl"]);
  response["inputs"]["callbackUrl"] = baseCallbackUrl;

  response["outputs"] = {};
  response["outputs"]["textOutput"] = req.body["textInput"];
  
  response["outputs"]["callbackUrl"] = baseCallbackUrl;

  if (req.hasOwnProperty("body") && req["body"].hasOwnProperty("resultStatus")) {
    response["outputs"]["actualResultStatus"] = req.body["resultStatus"];
    response["outputs"]["callbackUrl"] = baseCallbackUrl + '&status=' + req.body["resultStatus"];
  } else {
    response["outputs"]["actualResultStatus"] = null;
  }

  if (req.hasOwnProperty("body") && req["body"].hasOwnProperty("initialStatusCode")) {
    res.status(req["body"]["initialStatusCode"]).json(response);
  } else {
    res.status(202).json(response);
  }

  if (req.query["callbackUrl"] !== undefined) {
     const result = callCallbackUrl(response);
  }

});

app.use('/api/sleep', sleepRoute);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    let response = {};
    response['error'] = err;
    res.status(400).json(response);
  } else {
    next();
  }
});

module.exports = app;
