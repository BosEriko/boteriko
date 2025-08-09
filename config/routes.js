const express = require('express');
const cors = require('cors');
const http = require('http');

const discordRouter = require('@api/authentication/discord');
const twitchRouter = require('@api/authentication/twitch');
const detailsRouter = require('@api/utilities/details');
const tetrioProfileRouter = require('@api/profile/tetrio');

const { setupWebSocket } = require('@global/utilities/websocket');

const app = express();

// Optional but recommended for Heroku CORS issues (especially if frontend is separate)
app.use(cors());

// Required for parsing JSON bodies (if needed by routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redirect root to client URL
app.get('/', (req, res) => {
  res.redirect(Config.app.clientUrl);
});

// Route mounting
app.use('/api/authentication/discord', discordRouter);
app.use('/api/authentication/spotify/login', Controller.Music.get_account_information);
app.use('/api/authentication/spotify/callback', Controller.Music.get_refresh_token);
app.use('/api/authentication/twitch', twitchRouter);
app.use('/api/details', detailsRouter);
app.use('/api/profile/tetrio', tetrioProfileRouter);

const server = http.createServer(app);

setupWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log("✅ Connected to API Server.");
});
