const data = require('../data/data.js');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, race, message, channel) => {
    if (!race.finished && message.member && message.member.hasPermission('KICK_MEMBERS', false, false) || config.referees.includes(message.author.username)) {
        race.finished = true;
        race.seed = null;
        race.status = 'RACE CLOSED';
        data.setActiveRace(null);

        if (!race.ladder) {
            updateRaceMessage(race, channel);
        }
    }
};