const broadcastTwitch = require('../common/broadcastTwitch');
const updateRaceMessage = require('../common/updateRaceMessage');
const data = require('../data/data.js');

module.exports = (config, race, dChannel, tClient) => {
    let lastTime = data.getSpaceballs();
    let now = Date.now();
    if ((Math.floor(now - lastTime) / 1000) > config.minimumNewSpaceballsSeconds) {
        data.setSpaceballs(now);
        if (race.initiatedAt) {
            updateRaceMessage(race, dChannel);
        }

        broadcastTwitch(config, tClient, config.spaceballsClock);
    }
};