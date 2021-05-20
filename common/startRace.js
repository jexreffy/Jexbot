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
            if (!allReady) {
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
        updateRaceMessage(db, race, dChannel);
        dChannel.send(`**GO!!!**`).then().catch(console.error);
        await sleep(2000);

        race.status = 'RACE STARTED';
        updateRaceMessage(db, race, dChannel);
    })();
};