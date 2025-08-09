const express = require('express');
const axios = require('axios');

const get_refresh_token = express.Router();

get_refresh_token.get('/', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("No code found in query.");
  }

  const tokenUrl = 'https://accounts.spotify.com/api/token';

  try {
    const response = await axios.post(tokenUrl, new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.other.spotify.redirectUrl
    }), {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${env.other.spotify.clientId}:${env.other.spotify.clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    res.json(response.data);
  } catch (error) {
    await Utility.error_logger(error.response?.data || error.message);
    res.status(500).send('Failed to get tokens');
  }
});

module.exports = get_refresh_token;
