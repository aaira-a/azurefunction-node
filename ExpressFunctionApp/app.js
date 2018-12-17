const express = require("express");
const app = express();

app.get("/api/:foo", (req, res) => {
  res.json({
    foo: req.params.foo
  })
});

app.get("/api/:foo/:bar", (req, res) => {
  res.json({
    foo: req.params.foo,
    bar: req.params.bar
  })
});

module.exports = app;
