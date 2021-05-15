const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, message, channel) => {
    if (!race.finished && message.member && message.member.hasPermission('KICK_MEMBERS', false, false) || config.referees.includes(message.author.username)) {
        race.finished = true;
        race.seed = null;
        race.status = 'RACE CLOSED';
        db.setActiveRace(null);

        if (!race.ladder) {
            updateRaceMessage(db, race, channel);
        }
    }
};