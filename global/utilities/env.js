require('dotenv').config();
const env = {
    app: {
        clientUrl: process.env.APP_CLIENT_URL,
        timeZone: process.env.APP_TIME_ZONE
    },
    twitch: {
        channel: {
            username: process.env.TWITCH_CHANNEL_USERNAME,
            id: process.env.TWITCH_CHANNEL_ID
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
        bot: {
            token: process.env.DISCORD_BOT_TOKEN,
        },
        app: {
            clientId: process.env.DISCORD_APP_CLIENT_ID,
            clientSecret: process.env.DISCORD_APP_CLIENT_SECRET,
            redirectUrl: process.env.DISCORD_APP_REDIRECT_URL
        },
        webhook: {
            streaming: process.env.DISCORD_WEBHOOK_STREAMING
        }
    },
    groq: {
        model: process.env.GROQ_MODEL,
        apiKey: process.env.GROQ_API_KEY
    },
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }
};

module.exports = env;