require('module-alias/register');
require('../config/initializers/preload');
require('../app/services/bot/discord');
require('../app/services/bot/twitch');
const { bootstrap } = require('../src/main');
bootstrap();
