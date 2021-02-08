const config = require('../config.json');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (race, channel) => {
    const sleep = m => new Promise(r => setTimeout(r, m));
    (async() => {
        let countdown = config.countdowns[race.countdownIndex];
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
            await sleep(1000);
        }
        race.status = 'GO!!!';
        race.started = true;
        race.startedAt = new Date().getTime();
        updateRaceMessage(race, channel);
        await sleep(2000);
        race.status = 'RACE STARTED';
        updateRaceMessage(race, channel);
    })();
};