const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (race, dChannel, message, username) => {
    if (message.member && message.member.hasPermission('KICK_MEMBERS', false, false) || config.referees.includes(message.author.username)) {
        if (!race.started) {
            race.gatekeeper = username;
            updateRaceMessage(race, dChannel);
        }
    }
}