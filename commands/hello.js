const broadcastTwitch = require('../common/broadcastTwitch');

module.exports = (config, race, tClient, message) => {
    if (message === "CRON" || (message.member && message.member.hasPermission('KICK_MEMBERS', false, false)) || config.referees.includes(message.author.username)) {
        console.log("HELLO");
        race.lastHello = Date.now();
        broadcastTwitch(config, tClient, config.hello);
    }
};