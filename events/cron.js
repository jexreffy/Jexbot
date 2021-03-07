const config = require('../config.json');
const data = require('../data/data.js');
const broadcastMessage = require('../common/broadcastMessage');
const broadcastTwitch = require('../common/broadcastTwitch');

module.exports = (dClient, tClient) => {
    const guildId = data.getActiveRace();
    let race = data.getRaceData(guildId);

    if (!race.started || race.finished) return;

    let dChannel = dClient.channels.cache.find(channel => channel.name === config.guilds[guildId].channel);

    if (!race.ladder && config.categories[race.category].gtbk && !race.guessGameStarted && (Math.floor(Date.now() - race.startedAt) / 1000) > config.minimumGuessStartSeconds) {
        race.guessGameStarted = true;
        broadcastMessage(config, dChannel, tClient, config.gtGuessIntro, false);
    } else if (!race.lastHello || (Math.floor(Date.now() - race.lastHello) / 1000) > config.helloInterval) {
        race.lastHello = Date.now();
        broadcastTwitch(config, tClient, config.hello);
    }

    data.setRaceData(guildId, race);
};