const express = require("express");
const jsonfile = require("jsonfile");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

// Workaround for Azure Function as discussed in GitHub issue
// https://github.com/yvele/azure-function-express/issues/15
app.use(bodyParser.json({ type: 'application/*+json' }));

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
  if (req.hasOwnProperty("body") && req["body"].hasOwnProperty("allTypesInputs")) {
    if (req.body["allTypesInputs"].hasOwnProperty("textInput")) {
      response["textOutput"] = req.body["allTypesInputs"]["textInput"];
    }

    if (req.body["allTypesInputs"].hasOwnProperty("decimalInput")) {
      response["decimalOutput"] = req.body["allTypesInputs"]["decimalInput"];
    }

    if (req.body["allTypesInputs"].hasOwnProperty("integerInput")) {
      response["integerOutput"] = req.body["allTypesInputs"]["integerInput"];
    }

    if (req.body["allTypesInputs"].hasOwnProperty("booleanInput")) {
      if (typeof req.body["allTypesInputs"]["booleanInput"] === 'boolean') {
        response["booleanOutput"] = req.body["allTypesInputs"]["booleanInput"];
      }
      else {
        response["booleanOutput"] = null;
      }
    }

    if (req.body["allTypesInputs"].hasOwnProperty("datetimeInput")) {
      response["datetimeOutput"] = req.body["allTypesInputs"]["datetimeInput"];
    }

    if (req.body["allTypesInputs"].hasOwnProperty("collectionInput")) {
      if (req.body["allTypesInputs"]["collectionInput"] instanceof Array) {
        response["collectionOutput"] = req.body["allTypesInputs"]["collectionInput"];
      }
      else {
        response["collectionOutput"] = null;
      }
    }
  }
  res.json(response);
});

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
