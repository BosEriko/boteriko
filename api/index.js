const express = require('express');
const cors = require('cors');
const discordRouter = require('./authentication/discord');
const twitchRouter = require('./authentication/twitch');

const app = express();

// Optional but recommended for Heroku CORS issues (especially if frontend is separate)
app.use(cors());

// Required for parsing JSON bodies (if needed by routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route mounting
app.use('/api/authentication', discordRouter);
app.use('/api/authentication', twitchRouter);

// Heroku provides PORT via environment variable
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
