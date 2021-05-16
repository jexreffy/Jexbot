const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, username) => {
    if (!race.finished && config.referees.includes(username)) {
        race.finished = true;
        race.seed = null;
        race.status = 'RACE CLOSED';
        db.setActiveRace(null);

        if (!race.ladder) {
            updateRaceMessage(db, race, dChannel);
        }
    }
};