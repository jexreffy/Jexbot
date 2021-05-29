const broadcastMessage = require('../common/broadcastMessage');
const getRaceTime = require('../common/getRaceTime');
const onRunnerFinished = require('../common/onRunnerFinished');

module.exports = (config, db, race, dChannel, tClient, username, message) => {
    let player = race.players.find(x => x.username === username);

    if (race.started && player && !player.finished && !player.forfeited) {
        player.finished = true;
        race.remainingPlayers -= 1;

        let time = Date.now() - race.startedAt;
        if (time < 0) {
            time = 0;
        }
        player.time = (time / 1000) * 1000; //Floor to the nearest second for record keeping purposes.

        if (db.getPlayerPB(username, race.category) > player.time) {
            db.setPlayerPB(username, race.category, player.time);
        }

        broadcastMessage(config, dChannel, tClient, `${username} has finished with a time of ${getRaceTime(time)}.`, true);

        if (race.teams) {
            let allDone = true;
            race.players.forEach(x => {
                if (player.team === x.team) {
                    allDone = allDone && x.finished;
                }
            })
            if (allDone) {
                broadcastMessage(config, dChannel, tClient, `Team ${(player.team + 1)} has finished.`, true);
            }
        }

        onRunnerFinished(config, db, race, dChannel, tClient, message);
    } else {
        let time = new Date();
        console.log(time.toLocaleString('en-US') + ' done: ' + username + ' is not in the race!');
    }
};