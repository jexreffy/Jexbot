const broadcastMessage = require('../common/broadcastTwitch');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, race, dChannel, tClient) => {
    let lastTime = race.lastDickTime;
    if ((Math.floor(((new Date().getTime()) - lastTime)) / 1000) > config.minimumNewDickSeconds) {
        if (race.started) {
            race.dickCount += 1;
            race.lastDickTime = Date.now();

            if (race.initiatedAt) {
                updateRaceMessage(race, dChannel);
            }

            let dickMessage = config.dickMessages[Math.floor(Math.random() * Math.floor(config.dickMessages.length))].replace('RICHARD', race.dickCount);

            broadcastMessage(tClient, dickMessage);
        }
    }
};