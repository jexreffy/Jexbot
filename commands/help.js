const config = require('../config.json');

module.exports = (tClient, tChannel) => {
    tClient.say(tChannel, config.help);
};