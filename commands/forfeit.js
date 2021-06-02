const broadcastMessage = require('../common/broadcastMessage');
const onRunnerFinished = require('../common/onRunnerFinished');

module.exports = (config, db, race, dChannel, tClient, username, message) => {
    let player = race.players.find(x => x.username === username);

    if (race.started && player && !player.finished && !player.forfeited) {
        player.forfeited = true;
        race.remainingPlayers -= 1;

        broadcastMessage(config, dChannel, tClient, `${username} has forfeited.`, true);

        if (race.teams && !race.relay) {
            let anyForfeit = false;
            race.players.forEach(x => {
                if (player.team === x.team) {
                    anyForfeit = anyForfeit || x.forfeited;
                }
            })
            if (!anyForfeit) {
                broadcastMessage(config, dChannel, tClient, `Team ${(player.team + 1)} has forfeited.`, true);
            }
        } else if (race.teams && race.relay) {
            player.finished = true;

            let allDone = true;
            race.players.forEach(x => {
                if (player.team === x.team) {
                    allDone = allDone && x.finished;
                }
            })
            if (allDone) {
                broadcastMessage(config, dChannel, tClient, `Team ${(player.team + 1)} has forfeited.`, true);
            } else {
                let time = Date.now() - race.startedAt;
                if (time < 0) {
                    time = 0;
                }

                let teamTime = 0;
                race.players.forEach(x => {
                    if (player.team === x.team && x.finished) {
                        teamTime += x.time;
                    }
                })

                player.time = (time / 1000) * 1000 - teamTime;

                race.legStartTime[player.team] = Date.now() + (config.relayLegDelaySeconds + config.relayForfeitDelaySeconds) * 1000;

                let nextPlayer = race.players.find(x => x.team === player.team && x.leg === player.leg + 1);
                let thisMember = dChannel.members.find(x => x.user.username === player.username);
                let nextMember = dChannel.members.find(x => x.user.username === nextPlayer.username);
                dChannel.send(`<@${thisMember.id}> You mush let the credits run to completion **WITHOUT** fast forwarding.`);
                dChannel.send(`<@${nextMember.id}> ${player.username} has finished. You will be able to start your leg of the relay in ${(config.relayLegDelaySeconds + config.relayForfeitDelaySeconds) / 60} minutes.`);
            }
        }

        onRunnerFinished(config, db, race, dChannel, tClient, message);
    } else {
        let time = new Date();
        console.log(time.toLocaleString('en-US') + ' forfeit: ' + username + ' is not in the race!');
    }
};