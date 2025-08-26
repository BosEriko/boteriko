const express = require('express');
const disconnect = express.Router();

disconnect.post('/', async (req, res) => {
  console.log("Disconnect TETR.IO Endpoint");
});

module.exports = disconnect;
