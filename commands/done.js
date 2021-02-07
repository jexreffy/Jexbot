const config = require('../config.json');
const updateRaceMessage = require('../common/updateRaceMessage');
const elo = require('../elo/elo.js');
const sleep = m => new Promise(r => setTimeout(r, m));

module.exports = (race, channel, username, message) => {
    let player = race.players.find(x => x.username === username);

    if (race.started && player && !player.finished && !player.forfeited) {
        player.finished = true;

        let time = new Date().getTime() - race.startedAt;
        if (time < 0) {
            time = 0;
        }
        player.time = time;
        race.remainingPlayers -= 1;

        let seconds = Math.floor((time / 1000) % 60);
        let minutes = Math.floor((time / (1000 * 60)) % 60);
        let hours = Math.floor((time / (1000 * 60 * 60)) % 24);
        let msgTime = hours.toString().padStart(2, "0") + ':' + minutes.toString().padStart(2, "0") + ':' + seconds.toString().padStart(2, "0");
        channel.send(`**${username} has finished with a time of ${msgTime}.**`);

        let role = message.guild.roles.cache.find(r => r.name === config.racerRole);
        message.member.roles.remove(role.id).then().catch(console.error);

        if (race.remainingPlayers < 1) {
            race.finished = true;
            race.status = 'RACE FINISHED';
            race.players.sort(function(a, b) {
                if (a.time == null) {
                    if (b.time) {
                        return 1;
                    }
                }
                if (b.time == null) {
                    if (a.time) {
                        return -1;
                    }
                }
                if (b.forfeited === true) {
                    if (!a.forfeited) {
                        return 1;
                    }
                }
                if (a.forfeited === true) {
                    if (!b.forfeited) {
                        return -1;
                    }
                }
                if (a.time > b.time) {
                    return 1;
                }
                if (a.time === b.time) {
                    return 0;
                }
                if (a.time < b.time) {
                    return -1;
                }
                return 0;
            });
            let adjustments = elo.resolveMatch(race.players, race.category);
            for (let i = 0; i < race.players.length; i++) {
                race.players[i].adjustment = adjustments[i];
            }

            channel.send(`**The race has finished.**`);
        }
        updateRaceMessage(race, channel);
    } else {
        let time = new Date();
        console.log(time.toLocaleString('en-US') + ' done: ' + username + ' is not in the race!');
    }
};