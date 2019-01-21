const express = require("express");
const router = express.Router();
const getSleep = require("./getSleep");

router.get('/', getSleep);

module.exports = router;
