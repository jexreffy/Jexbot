const broadcastTwitch = require('../common/broadcastTwitch');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, race, dChannel, tClient) => {
    let lastTime = race.lastDickTime;
    if (race.started && (Math.floor((Date.now() - lastTime)) / 1000) > config.minimumNewDickSeconds) {
        race.dickCount += 1;
        race.lastDickTime = Date.now();

        if (race.initiatedAt) {
            updateRaceMessage(race, dChannel);
        }

        let dickMessage = config.dickMessages[Math.floor(Math.random() * Math.floor(config.dickMessages.length))].replace('RICHARD', race.dickCount);

        broadcastTwitch(tClient, dickMessage);
    }
};