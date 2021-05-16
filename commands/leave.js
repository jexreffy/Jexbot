const onRunnerRemoved = require('../common/onRunnerRemoved');
const startRace = require('../common/startRace');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, username, message) => {
    if (!race.invitational) {
        let player = race.players.find(x => x.username === username);

        if (!race.finished && player) {
            onRunnerRemoved(config, db, race, player, message);

            let allReady = race.players.every(x => x.ready === true);
            if (!race.gatekeeper && allReady && race.players.length > 1) {
                if (race.teams) {
                    race.teams = false;
                    race.players[0].ready = false;
                    updateRaceMessage(db, race, dChannel);
                } else {
                    startRace(config, db, race, dChannel);
                }
            } else {
                race.teams = false;
                updateRaceMessage(db, race, dChannel);
            }

        } else {
            let time = new Date();
            console.log(time.toLocaleString('en-US') + ' leave: ' + username + ' is not in the race!');
        }
    }
};