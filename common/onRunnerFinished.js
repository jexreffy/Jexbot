const broadcastMessage = require('../common/broadcastMessage');
const gtbkWinner = require('../common/gtbkWinner');
const updateRaceMessage = require('../common/updateRaceMessage');
const elo = require('../elo/elo.js');

module.exports = (config, db, race, dChannel, tClient, message) => {
    let role = message.guild.roles.cache.find(r => r.name === config.guilds[message.guild.id].racerRole);
    message.member.roles.remove(role.id).then().catch(console.error);

    if (race.remainingPlayers < 1) {
        race.finished = true;
        race.status = 'RACE FINISHED';
        db.setActiveRace(null);
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
        let adjustments = elo.resolveMatch(db, race.players, race.category);
        for (let i = 0; i < race.players.length; i++) {
            race.players[i].adjustment = adjustments[i];
        }

        const sleep = m => new Promise(r => setTimeout(r, m));
        (async() => {
            updateRaceMessage(db, race, dChannel);
            await sleep(5000);
            broadcastMessage(config, dChannel, tClient, `The race has finished.`, true);
        })();
    } else if (race.remainingPlayers <= race.players.length / 2 && !race.spoilersAllowed) {
        race.spoilersAllowed = true;

        const sleep = m => new Promise(r => setTimeout(r, m));
        (async() => {
            updateRaceMessage(db, race, dChannel);
            await sleep(5000);
            broadcastMessage(config, dChannel, tClient, `Spoilers are now allowed for the race.`, true);
            await sleep(5000);
            gtbkWinner(config, race, dChannel, tClient);
        })();
    } else {
        updateRaceMessage(db, race, dChannel);
    }
}