const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');

const discordRouter = require('@api/authentication/discord');
const twitchRouter = require('@api/authentication/twitch');

const { setupWebSocket } = require('@global/utilities/websocket');

const app = express();

// Optional but recommended for Heroku CORS issues
app.use(cors());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from "public" folder
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Redirect root to client URL
app.get('/', (req, res) => { res.redirect(Config.app.clientUrl) });

// Authentication Routes
app.use('/api/authentication/discord/callback', discordRouter);
app.use('/api/authentication/discord/connect', Controller.Discord.authentication_connect);
app.use('/api/authentication/spotify/callback', Controller.Music.authentication_callback);
app.use('/api/authentication/spotify/login', Controller.Music.authentication_login);
app.use('/api/authentication/twitch/callback', twitchRouter);
app.use('/api/authentication/twitch/login', Controller.Twitch.authentication_login);

// Detail Routes
app.use('/api/detail/tetrio', Controller.Detail.tetrio);
app.use('/api/detail/twitch', Controller.Detail.twitch);

const server = http.createServer(app);

setupWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log("✅ Connected to API Server.");
});
