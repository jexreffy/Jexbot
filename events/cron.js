const config = require('../config.json');
const data = require('../data/data.js');

module.exports = (dClient, tClient) => {
    let race = data.getRace();

    let dChannel = dClient.channels.cache.find(channel => channel.name === config.channel);

    if (race.started && !race.guessGameStarted && (Math.floor(Date().now() - race.startedAt) / 1000) > config.minimumGuessStartSeconds) {
        const broadcastMessage = require('../common/broadcastMessage');
        broadcastMessage(config, dChannel, tClient, config.gtGuessIntro, false);
        race.guessGameStarted = true;
    } else if ((Math.floor(Date().now() - race.lastHello) / 1000) > config.helloInterval) {
        const hello = require('../commands/hello');
        hello(config, race, tClient, "CRON");
    }

    data.setRace(race);
};