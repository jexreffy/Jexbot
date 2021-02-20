const config = require('../config.json');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (race, channel) => {
    const sleep = m => new Promise(r => setTimeout(r, m));
    (async() => {
        let countdown = config.countdowns[race.countdownIndex];
        let jokeTime = Math.floor(Math.random() * config.jokeCountdownMax);
        let jokeUnits = config.jokeUnits[Math.floor(Math.random() * config.jokeUnits.length)];
        channel.send(`**The race will start in ${jokeTime} ${jokeUnits}**`);
        race.status = countdown.firstLine;
        updateRaceMessage(race, channel);
        await sleep(countdown.firstDelay);
        race.status = countdown.secondLine;
        updateRaceMessage(race, channel);
        await sleep(countdown.secondDelay);
        for (let i = countdown.countdown; i > 0; i--) {
            race.status = 'Starting in: ' + i;
            updateRaceMessage(race, channel);
            let allReady = race.players.every(x => x.ready === true);
            if (!allReady) {
                race.status = 'INTERRUPTED: WAITING FOR PLAYERS';
                updateRaceMessage(race, channel);
                return;
            }

            if (i <= 5) channel.send(`**${i}**`);
            await sleep(1000);
        }
        race.status = 'GO!!!';
        race.started = true;
        race.startedAt = new Date().getTime();
        updateRaceMessage(race, channel);
        channel.send(`**GO!!!**`);
        await sleep(2000);
        race.status = 'RACE STARTED';
        updateRaceMessage(race, channel);
    })();
};