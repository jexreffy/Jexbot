const broadcastMessage = require('../common/broadcastMessage');

module.exports = (config, race, dChannel, tClient, tChannel) => {
    let lastTime = race.lastCallback;
    if (race.started && (Math.floor((Date.now() - lastTime)) / 1000) > config.minimumNewCallbackSeconds) {
        race.lastCallback = Date.now();

        let time = race.lastCallback - race.startedAt;
        if (time < 0) {
            time = 0;
        }

        let seconds = Math.floor((time / 1000) % 60);
        let minutes = Math.floor((time / (1000 * 60)) % 60);
        let hours = Math.floor((time / (1000 * 60 * 60)) % 24);
        let msgTime = hours.toString().padStart(2, "0") + ':' + minutes.toString().padStart(2, "0") + ':' + seconds.toString().padStart(2, "0");

        broadcastMessage(config, dChannel, tClient, `${msgTime}, go back to ${tChannel.replace('#', '')}'s stream.`, true);
    }
}