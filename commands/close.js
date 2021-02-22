const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (race, message, channel) => {
    if (race.messageId && !race.finished && message.member && message.member.hasPermission('KICK_MEMBERS', false, false)) {
        race.finished = true;
        race.seed = null;
        race.status = 'RACE CLOSED';
        updateRaceMessage(race, channel);
    }
};