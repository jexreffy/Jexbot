const onRunnerFinished = require('../common/onRunnerFinished');
const onRunnerRemoved = require('../common/onRunnerRemoved');
const startRace = require('../common/startRace');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, tClient, message) => {
    if (config.referees.includes(message.author.username)) {
        let match = message.content.match(/^[.!](\bkick\b)([ ]{0,1})([a-zA-Z0-9%]{0,20})/i);
        let player = race.players.find(x => x.username === match[3]);

        if (!race.finished && player) {
            onRunnerRemoved(config, db, race, player, message);
    
            let allReady = race.players.every(x => x.ready === true);
            if (!race.started && !race.gatekeeper && allReady && race.players.length > 1) {
                if (race.teams) {
                    race.teams = false;
                    race.players[0].ready = false;
                    updateRaceMessage(db, race, dChannel);
                } else {
                    startRace(config, db, race, dChannel);
                }
            } else if (race.started) {
                player.forfeited = true;
                onRunnerFinished(config, db, race, dChannel, tClient, message);
            } else if (!race.started) {
                race.teams = false;
                updateRaceMessage(db, race, dChannel);
            }
        } else {
            let time = new Date();
            console.log(time.toLocaleString('en-US') + ' leave: ' + player.username + ' is not in the race!');
        }
    }
};