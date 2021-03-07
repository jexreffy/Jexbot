const config = require('../config.json');
const data = require('../data/data.js');

module.exports = (dClient, tClient) => {
    const guildId = data.getActiveRace();
    let race = data.getRaceData(guildId);

    if (!race.started || race.finished) return;

    let dChannel = dClient.channels.cache.find(channel => channel.name === config.guilds[guildId].channel);

    if (!race.guessGameStarted && (Math.floor(Date.now() - race.startedAt) / 1000) > config.minimumGuessStartSeconds) {
        const broadcastMessage = require('../common/broadcastMessage');
        broadcastMessage(config, dChannel, tClient, config.gtGuessIntro, false);
        race.guessGameStarted = true;
    } else if (!race.lastHello || (Math.floor(Date.now() - race.lastHello) / 1000) > config.helloInterval) {
        const hello = require('../commands/hello');
        hello(config, race, tClient, "CRON");
    }

    data.setRaceData(guildId, race);
};