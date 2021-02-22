const broadcastTwitch = require('../common/broadcastTwitch');

module.exports = (config, race, tClient, message) => {
    if ((message.member && message.member.hasPermission('KICK_MEMBERS', false, false)) || config.referees.includes(message.author.username)) {
        broadcastTwitch(config, tClient, config.hello);
    }
};