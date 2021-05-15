const broadcastMessage = require('../common/broadcastMessage');
const onRunnerFinished = require('../common/onRunnerFinished');

module.exports = (config, db, race, dChannel, tClient, username, message) => {
    let player = race.players.find(x => x.username === username);

    if (race.started && player && !player.finished && !player.forfeited) {
        player.forfeited = true
        race.remainingPlayers -= 1;

        broadcastMessage(config, dChannel, tClient, `${username} has forfeited.`, true);

        onRunnerFinished(config, db, race, dChannel, tClient, message);
    } else {
        let time = new Date();
        console.log(time.toLocaleString('en-US') + ' forfeit: ' + username + ' is not in the race!');
    }
};