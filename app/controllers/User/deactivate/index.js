const express = require('express');
const deactivate = express.Router();

deactivate.post('/', async (req, res) => {
  console.log("Deactivate User Endpoint");
});

module.exports = deactivate;
