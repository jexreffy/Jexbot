const updateRaceMessage = require('../common/updateRaceMessage');
const startRace = require('../common/startRace');
const config = require('../config.json');

module.exports = (race, channel, message, username) => {
    if (message.member && message.member.hasPermission('KICK_MEMBERS', false, false) || config.referees.includes(message.author.username)) {
        if (!race.started && race.gatekeeper === username) {
            let allReady = race.players.every(x => x.ready === true);
            if (allReady && race.players.length > 1) {
                startRace(race, channel);
            } else {
                updateRaceMessage(race, channel);
            }
        }
    }
}