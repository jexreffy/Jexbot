const onRunnerRemoved = require('../common/onRunnerRemoved');
const startRace = require('../common/startRace');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, race, dChannel, username, message) => {
    let player = race.players.find(x => x.username === username);

    if (!race.finished && player) {
        onRunnerRemoved(config, race, player, message);

        let allReady = race.players.every(x => x.ready === true);
        if (!race.gatekeeper && allReady && race.players.length > 1) {
            startRace(config, race, dChannel);
        } else {
            updateRaceMessage(race, dChannel);
        }
    } else {
        let time = new Date();
        console.log(time.toLocaleString('en-US') + ' leave: ' + username + ' is not in the race!');
    }
};