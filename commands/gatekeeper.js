const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, username) => {
    if (config.referees.includes(username)) {
        if (!race.started) {
            race.gatekeeper = username;
            updateRaceMessage(db, race, dChannel);
        }
    }
}