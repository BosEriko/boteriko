const env = require('@global/utilities/env');
const express = require('express');
const cors = require('cors');
const http = require('http');
const discordRouter = require('@api/authentication/discord');
const twitchRouter = require('@api/authentication/twitch');
const { setupWebSocket } = require('@global/utilities/websocket');

const app = express();

// Optional but recommended for Heroku CORS issues (especially if frontend is separate)
app.use(cors());

// Required for parsing JSON bodies (if needed by routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redirect root to client URL
app.get('/', (req, res) => {
  res.redirect(env.app.clientUrl);
});

// Route mounting
app.use('/api', discordRouter);
app.use('/api', twitchRouter);

const server = http.createServer(app);

setupWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ WebSocket running on http://localhost:${PORT}`);
});
