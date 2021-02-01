const config = require('../config.json');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (race, channel) => {
    const sleep = m => new Promise(r => setTimeout(r, m));
    (async() => {
        race.status = 'You are looking live at a bunch of Nerds about to play Rando!!!';
        updateRaceMessage(race, channel);
        await sleep(5000);
        race.status = 'Yay! He said the thing!!!';
        updateRaceMessage(race, channel);
        await sleep(2500);
        race.status = 'Starting in: 5';
        updateRaceMessage(race, channel);
        let allReady = race.players.every(x => x.ready == true);
        if (!allReady) {
            race.status = 'INTERRUPTED: WAITING FOR PLAYERS';
            updateRaceMessage(race, channel);
            return;
        }
        await sleep(1000);
        race.status = 'Starting in: 4';
        updateRaceMessage(race, channel);
        await sleep(1000);
        race.status = 'Starting in: 3';
        updateRaceMessage(race, channel);
        await sleep(1000);
        race.status = 'Starting in: 2';
        updateRaceMessage(race, channel);
        await sleep(1000);
        race.status = 'Starting in: 1';
        updateRaceMessage(race, channel);
        await sleep(1000);
        allReady = race.players.every(x => x.ready == true);
        if (!allReady) {
            race.status = 'INTERRUPTED: WAITING FOR PLAYERS';
            updateRaceMessage(race, channel);
            return;
        }
        race.status = 'GO!!!';
        race.started = true;
        race.startedAt = new Date().getTime() + race.offset;
        updateRaceMessage(race, channel);
        await sleep(2000);
        race.status = 'RACE STARTED';
        updateRaceMessage(race, channel);
    })();

    return;
};