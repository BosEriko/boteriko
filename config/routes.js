const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');

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
app.use('/legacy/authentication/discord/callback', Controller.Discord.authentication_callback);
app.use('/legacy/authentication/discord/connect', Controller.Discord.authentication_connect);
app.use('/legacy/authentication/spotify/callback', Controller.Music.authentication_callback);
app.use('/legacy/authentication/spotify/login', Controller.Music.authentication_login);
app.use('/legacy/authentication/tetrio/connect', Controller.Tetrio.authentication_connect);
app.use('/legacy/authentication/twitch/callback', Controller.Twitch.authentication_callback);
app.use('/legacy/authentication/twitch/login', Controller.Twitch.authentication_login);

// Detail Routes
app.use('/legacy/detail/tetrio', Controller.Detail.tetrio);
app.use('/legacy/detail/twitch', Controller.Detail.twitch);

// User Routes
app.use('/legacy/user/deactivate', Controller.User.deactivate);
app.use('/legacy/user/profile', Controller.User.profile);

// Game Routes
app.use('/legacy/game/profile', Controller.Game.profile);
app.use('/legacy/game/update_list', Controller.Game.update_list);

// Anime Routes
app.use('/legacy/anime/profile', Controller.Anime.profile);

// Manga Routes
app.use('/legacy/manga/profile', Controller.Manga.profile);

// Data Routes
app.use('/legacy/data/initial', Controller.Data.initial);
app.use('/legacy/data/search', Controller.Data.search);
app.use('/legacy/data/overlay', Controller.Data.overlay);

// TETR.IO Routes
app.use('/legacy/tetrio/disconnect', Controller.Tetrio.disconnect);

// Discord Routes
app.use('/legacy/discord/disconnect', Controller.Discord.disconnect);

const server = http.createServer(app);

setupWebSocket(server);

module.exports = app;
