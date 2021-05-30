const getRandom = require('../common/getRandom');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel) => {
    const sleep = m => new Promise(r => setTimeout(r, m));
    (async() => {
        let countdown = config.countdowns[race.countdownIndex];
        let jokeTime = getRandom(config.jokeCountdownMax);
        let jokeUnits = config.jokeUnits[getRandom(config.jokeUnits.length)];
        dChannel.send(`**The race will start in ${jokeTime} ${jokeUnits}**`).then().catch(console.error);
        await sleep(100);

        race.status = countdown.firstLine;
        dChannel.send(`**${race.status}**`).then().catch(console.error);
        updateRaceMessage(db, race, dChannel);
        await sleep(countdown.firstDelay);

        race.status = countdown.secondLine;
        dChannel.send(`**${race.status}**`).then().catch(console.error);
        updateRaceMessage(db, race, dChannel);
        await sleep(countdown.secondDelay);

        for (let i = countdown.countdown; i > 0; i--) {
            race.status = 'Starting in: ' + i;
            updateRaceMessage(db, race, dChannel);
            let allReady = race.players.every(x => x.ready === true);
            if (!(race.gatekeeper || allReady)) {
                race.status = 'INTERRUPTED: WAITING FOR PLAYERS';
                updateRaceMessage(db, race, dChannel);
                return;
            }

            if (i <= 5) dChannel.send(`**${i}**`).then().catch(console.error);
            await sleep(1000);
        }

        race.status = 'GO!!!';
        race.started = true;
        race.startedAt = Date.now();

        if (race.teams && race.relay) {
            let teamCount = 0;
            for (let i = 0; i < race.players.length; i++) {
                if (teamCount < race.players[i].team + 1) {
                    teamCount = race.players[i].team + 1;
                }
            }

            for (let i = 0; i < teamCount; i++) {
                race.legStartTime.push(0);
            }
        }


        dChannel.send(`**GO!!!**`).then().catch(console.error);
        await sleep(100);

        updateRaceMessage(db, race, dChannel);
        await sleep(1900);

        race.status = 'RACE STARTED';
        updateRaceMessage(db, race, dChannel);
    })();
};