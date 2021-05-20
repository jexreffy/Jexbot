const broadcastTwitch = require('../common/broadcastTwitch');
const getRandom = require('../common/getRandom');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, tClient) => {
    if (race.started && (!race.lastDickTime || (Math.floor((Date.now() - race.lastDickTime)) / 1000) > config.minimumNewDickSeconds)) {
        race.dickCount += 1;
        race.lastDickTime = Date.now();

        if (race.initiatedAt) {
            updateRaceMessage(db, race, dChannel);
        }

        let dickMessage = `${race.seedRoller} ${config.dickMessages[getRandom(config.dickMessages.length)].replace('RICHARD', race.dickCount)}`;

        broadcastTwitch(config, tClient, dickMessage);
    }
};