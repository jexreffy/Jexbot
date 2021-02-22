const broadcastTwitch = require('../common/broadcastTwitch');
const updateRaceMessage = require('../common/updateRaceMessage');
const data = require('../data/data.js');

module.exports = (config, race, dChannel, tClient) => {
    let lastTime = data.getSpaceballs();
    if ((Math.floor(((new Date().getTime()) - lastTime)) / 1000) > config.minimumNewSpaceballsSeconds) {
        data.setSpaceballs(Date.now() + 3600000);
        if (race.initiatedAt) {
            updateRaceMessage(race, dChannel);
        }

        broadcastTwitch(config, tClient, config.spaceballsClock);
    }
};