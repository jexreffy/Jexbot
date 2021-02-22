const broadcastTwitch = require('../common/broadcastTwitch');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, race, dChannel, tClient) => {
    const sleep = m => new Promise(r => setTimeout(r, m));
    (async() => {
        let countdown = config.countdowns[race.countdownIndex];
        let jokeTime = Math.floor(Math.random() * config.jokeCountdownMax);
        let jokeUnits = config.jokeUnits[Math.floor(Math.random() * config.jokeUnits.length)];
        dChannel.send(`**The race will start in ${jokeTime} ${jokeUnits}**`).then().catch(console.error);
        race.status = countdown.firstLine;
        broadcastTwitch(config, tClient, race.status);
        updateRaceMessage(race, dChannel);
        await sleep(countdown.firstDelay);

        race.status = countdown.secondLine;
        broadcastTwitch(config, tClient, race.status);
        updateRaceMessage(race, dChannel);
        await sleep(countdown.secondDelay);

        for (let i = countdown.countdown; i > 0; i--) {
            race.status = 'Starting in: ' + i;
            updateRaceMessage(race, dChannel);
            let allReady = race.players.every(x => x.ready === true);
            if (!allReady) {
                race.status = 'INTERRUPTED: WAITING FOR PLAYERS';
                updateRaceMessage(race, dChannel);
                return;
            }

            if (i <= 5) dChannel.send(`**${i}**`).then().catch(console.error);
            await sleep(1000);
        }

        race.status = 'GO!!!';
        race.started = true;
        race.startedAt = new Date().getTime();
        updateRaceMessage(race, dChannel);
        dChannel.send(`**GO!!!**`).then().catch(console.error);
        await sleep(2000);

        race.status = 'RACE STARTED';
        updateRaceMessage(race, dChannel);
    })();
};