const config = require('../config.json');
const data = require('../data/data.js');

module.exports = (dClient, tClient) => {
    let race = data.getRace();

    let dChannel = dClient.channels.cache.find(channel => channel.name === config.channel);

    if (!race.started && !race.guessGameStarted && (Math.floor(((new Date().getTime()) - race.startedAt)) / 1000) > config.minimumGuessStartSeconds) {
        for (let i = 0; i < config.twitchChannels.length; i++) {
            tClient.say(`${config.twitchChannels[i]}`, config.gtGuessIntro);
        }

        dChannel.send(config.gtGuessIntro);

        race.guessGameStarted = true;
    }

    data.setRace(race);
};