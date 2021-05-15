const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (db, race, dChannel, username) => {
    let player = race.players.find(x => x.username === username);

    if (!race.started && player) {
        player.ready = false;
        updateRaceMessage(db, race, dChannel);
    }
};