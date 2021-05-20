const broadcastMessage = require('../common/broadcastMessage');
const getRaceTime = require('../common/getRaceTime');

module.exports = (config, race, dChannel, tClient, tChannel) => {
    if (race.started && (!race.lastCallback || (Math.floor((Date.now() - race.lastCallback)) / 1000) > config.minimumNewCallbackSeconds)) {
        race.lastCallback = Date.now();

        let time = race.lastCallback - race.startedAt;
        if (time < 0) {
            time = 0;
        }

        broadcastMessage(config, dChannel, tClient, `${getRaceTime(time)}, go back to ${tChannel.replace('#', '')}'s stream.`, true);
    }
}