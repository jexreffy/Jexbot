const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, username) => {
    if (config.referees.includes(username)) {
        if (!race.started) {
            race.locked = true;
            race.status = 'SIGNUPS CLOSED: WAITING FOR PLAYERS TO READY UP';
            updateRaceMessage(db, race, dChannel);
        }
    }
}