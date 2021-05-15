const startRace = require('../common/startRace');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, username) => {
    let player = race.players.find(x => x.username === username);

    if (!race.started && player) {
        player.ready = true;

        let allReady = race.players.every(x => x.ready === true);
        if (!race.gatekeeper && allReady && race.players.length > 1) {
            startRace(config, db, race, dChannel);
        } else {
            updateRaceMessage(db, race, dChannel);
        }
    } else {
        console.log('Player has not joined!');
    }
};