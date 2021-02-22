const config = require('../config.json');

module.exports = (race, tClient, message) => {
    if ((message.member && message.member.hasPermission('KICK_MEMBERS', false, false)) || config.referees.includes(message.author.username)) {
        for (let i = 0; i < config.twitchChannels.length; i++) {
            tClient.say(`#${config.twitchChannels[i]}`, config.hello);
        }
    }
};