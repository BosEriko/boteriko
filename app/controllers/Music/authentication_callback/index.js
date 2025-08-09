const express = require('express');
const axios = require('axios');

const authentication_callback = express.Router();

authentication_callback.get('/', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("No code found in query.");
  }

  const tokenUrl = 'https://accounts.spotify.com/api/token';

  try {
    const response = await axios.post(tokenUrl, new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: Config.other.spotify.redirectUrl
    }), {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${Config.other.spotify.clientId}:${Config.other.spotify.clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    res.json(response.data);
  } catch (error) {
    await Utility.error_logger(error.response?.data || error.message);
    res.status(500).send('Failed to get tokens');
  }
});

module.exports = authentication_callback;
