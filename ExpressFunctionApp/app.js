const express = require("express");
const path = require("path");
const app = express();


app.get("/api/hello", (req, res) => {
  res.json({
    "hello": "world"
  })
});

app.use('/api/docs', express.static(path.join(__dirname, 'docs')));

module.exports = app;
