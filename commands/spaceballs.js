const broadcastTwitch = require('../common/broadcastTwitch');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, tClient) => {
    let lastTime = db.getSpaceballs();
    let now = Date.now();
    if ((Math.floor(now - lastTime) / 1000) > config.minimumNewSpaceballsSeconds) {
        db.setSpaceballs(now);
        if (!race.ladder && race.initiatedAt) {
            updateRaceMessage(db, race, dChannel);
        }

        broadcastTwitch(config, tClient, config.spaceballsClock);
    }
};