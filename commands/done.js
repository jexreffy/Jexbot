const broadcastMessage = require('../common/broadcastMessage');
const getRaceTime = require('../common/getRaceTime');
const onRunnerFinished = require('../common/onRunnerFinished');

module.exports = (config, db, race, dChannel, tClient, username, message) => {
    let player = race.players.find(x => x.username === username);

    if (race.started && player && !player.finished && !player.forfeited) {
        if (race.teams && race.relay) {
            let hasFinished = race.players.filter(x => x.team === player.team && x.finished);

            if (player.leg !== hasFinished.length) return;
        }

        player.finished = true;
        race.remainingPlayers -= 1;

        let time = Date.now() - race.startedAt;
        if (time < 0) {
            time = 0;
        }

        let category = race.category;
        if (race.teams && race.relay) {
            category = race.legs[player.leg].category;
            let teamTime = 0;
            race.players.forEach(x => {
                if (player.team === x.team && x.finished) {
                    teamTime += x.time;
                }
            })

            player.time = (time / 1000) * 1000 - teamTime;

            broadcastMessage(config, dChannel, tClient, `${username} has finished with an individual time of ${getRaceTime(player.time)} and an overall time of ${getRaceTime(time)}.`, true);
        } else {
            player.time = (time / 1000) * 1000; //Floor to the nearest second for record keeping purposes.

            broadcastMessage(config, dChannel, tClient, `${username} has finished with a time of ${getRaceTime(time)}.`, true);
        }

        if (db.getPlayerPB(username, category) > player.time) {
            db.setPlayerPB(username, category, player.time);
        }

        if (race.teams) {
            let allDone = true;
            race.players.forEach(x => {
                if (player.team === x.team) {
                    allDone = allDone && x.finished;
                }
            })
            if (allDone) {
                broadcastMessage(config, dChannel, tClient, `Team ${(player.team + 1)} has finished.`, true);
            } else if (race.relay) {
                race.legStartTime[player.team] = Date.now() + config.relayLegDelaySeconds * 1000;

                let nextPlayer = race.players.find(x => x.team === player.team && x.leg === player.leg + 1);
                let thisMember = dChannel.members.find(x => x.user.username === player.username);
                let nextMember = dChannel.members.find(x => x.user.username === nextPlayer.username);
                dChannel.send(`<@${thisMember.id}> You mush let the credits run to completion **WITHOUT** fast forwarding.`);
                dChannel.send(`<@${nextMember.id}> ${player.username} has finished. You will be able to start your leg of the relay in ${config.relayLegDelaySeconds / 60} minutes.`);
            }
        }

        onRunnerFinished(config, db, race, dChannel, tClient, message);
    } else {
        let time = new Date();
        console.log(time.toLocaleString('en-US') + ' done: ' + username + ' is not in the race!');
    }
};