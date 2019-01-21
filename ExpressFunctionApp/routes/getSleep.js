function getSleep(req, res) {
  setTimeout(() => {
    res.send({"message": "OK"});
  }, 75000);
}

module.exports = getSleep;
