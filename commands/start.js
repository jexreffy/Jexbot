const startRace = require('../common/startRace');

module.exports = (config, db, race, dChannel, tClient, message, username) => {
    if (message.member && message.member.hasPermission('KICK_MEMBERS', false, false) || config.referees.includes(username)) {
        if (!race.started && race.gatekeeper === username) {
            startRace(config, db, race, dChannel);
        }
    }
}