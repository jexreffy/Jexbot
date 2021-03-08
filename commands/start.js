const updateRaceMessage = require('../common/updateRaceMessage');
const startRace = require('../common/startRace');

module.exports = (config, race, dChannel, tClient, message, username) => {
    if (message.member && message.member.hasPermission('KICK_MEMBERS', false, false) || config.referees.includes(username)) {
        if (!race.started && race.gatekeeper === username) {
            startRace(config, race, dChannel);
        }
    }
}