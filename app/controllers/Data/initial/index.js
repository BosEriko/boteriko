const express = require('express');
const initial = express.Router();

initial.get('/', async (req, res) => {
  console.log("Initial Data");
});

module.exports = initial;
