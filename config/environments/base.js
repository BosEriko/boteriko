require('dotenv').config();

const env = {
    app: {
        clientUrl: process.env.APP_CLIENT_URL,
        timeZone: process.env.APP_TIME_ZONE
    },
    stream: {
        start: parseInt(process.env.STREAM_START, 10),
        duration: process.env.STREAM_DURATION,
        days: process.env.STREAM_DAYS?.split(',').map(d => d.trim().toLowerCase()) || []
    },
    twitch: {
        channel: {
            id: process.env.TWITCH_CHANNEL_ID,
            username: process.env.TWITCH_CHANNEL_USERNAME,
            accessToken: process.env.TWITCH_CHANNEL_ACCESS_TOKEN,
            refreshToken: process.env.TWITCH_CHANNEL_REFRESH_TOKEN,
            clientId: process.env.TWITCH_CHANNEL_CLIENT_ID
        },
        bot: {
            id: process.env.TWITCH_BOT_ID,
            username: process.env.TWITCH_BOT_USERNAME,
            accessToken: process.env.TWITCH_BOT_ACCESS_TOKEN,
            refreshToken: process.env.TWITCH_BOT_REFRESH_TOKEN,
            clientId: process.env.TWITCH_BOT_CLIENT_ID
        },
        app: {
            clientId: process.env.TWITCH_APP_CLIENT_ID,
            clientSecret: process.env.TWITCH_APP_CLIENT_SECRET,
            redirectUrl: process.env.TWITCH_APP_REDIRECT_URL
        }
    },
    discord: {
        server: {
            id: process.env.DISCORD_SERVER_ID
        },
        owner: {
            id: process.env.DISCORD_OWNER_ID
        },
        bot: {
            token: process.env.DISCORD_BOT_TOKEN,
        },
        app: {
            clientId: process.env.DISCORD_APP_CLIENT_ID,
            clientSecret: process.env.DISCORD_APP_CLIENT_SECRET,
            redirectUrl: process.env.DISCORD_APP_REDIRECT_URL
        },
        webhook: {
            link: process.env.DISCORD_WEBHOOK_LINK,
            clip: process.env.DISCORD_WEBHOOK_CLIP,
            streaming: process.env.DISCORD_WEBHOOK_STREAMING,
            error: process.env.DISCORD_WEBHOOK_ERROR
        }
    },
    todoist: {
        apiToken: process.env.TODOIST_API_TOKEN
    },
    spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        refreshToken: process.env.SPOTIFY_REFRESH_TOKEN
    },
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }
};

module.exports = env;
