const broadcastMessage = require('../common/broadcastMessage');
const onRunnerFinished = require('../common/onRunnerFinished');

module.exports = (config, race, dChannel, tClient, username, message) => {
    let player = race.players.find(x => x.username === username);

    if (race.started && player && !player.finished && !player.forfeited) {
        player.finished = true;
        race.remainingPlayers -= 1;

        let time = Date.now() - race.startedAt;
        if (time < 0) {
            time = 0;
        }
        player.time = time;

        let seconds = Math.floor((time / 1000) % 60);
        let minutes = Math.floor((time / (1000 * 60)) % 60);
        let hours = Math.floor((time / (1000 * 60 * 60)) % 24);
        let msgTime = hours.toString().padStart(2, "0") + ':' + minutes.toString().padStart(2, "0") + ':' + seconds.toString().padStart(2, "0");

        broadcastMessage(config, dChannel, tClient, `${username} has finished with a time of ${msgTime}.`, true);

        onRunnerFinished(config, race, dChannel, tClient, message);
    } else {
        let time = new Date();
        console.log(time.toLocaleString('en-US') + ' done: ' + username + ' is not in the race!');
    }
};