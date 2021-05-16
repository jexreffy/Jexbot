const startRace = require('../common/startRace');

module.exports = (config, db, race, dChannel, username) => {
    if (!race.started && race.gatekeeper === username) {
        startRace(config, db, race, dChannel);
    }
}