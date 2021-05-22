const broadcastMessage = require('../common/broadcastMessage');
const onRunnerFinished = require('../common/onRunnerFinished');

module.exports = (config, db, race, dChannel, tClient, username, message) => {
    let player = race.players.find(x => x.username === username);

    if (race.started && player && !player.finished && !player.forfeited) {
        player.forfeited = true
        race.remainingPlayers -= 1;

        broadcastMessage(config, dChannel, tClient, `${username} has forfeited.`, true);

        if (race.teams) {
            let anyForfeit = false;
            race.players.forEach(x => {
                if (player.team === x.team) {
                    anyForfeit = anyForfeit || x.forfeited;
                }
            })
            if (!anyForfeit) {
                broadcastMessage(config, dChannel, tClient, `Team ${(player.team + 1)} has forfeited.`, true);
            }
        }

        onRunnerFinished(config, db, race, dChannel, tClient, message);
    } else {
        let time = new Date();
        console.log(time.toLocaleString('en-US') + ' forfeit: ' + username + ' is not in the race!');
    }
};