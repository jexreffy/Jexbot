const config = require('../config.json');

module.exports = (dClient, tClient) => {
    if ((Math.floor(((new Date().getTime()) - race.startedAt)) / 1000) > config.minimumGuessStartSeconds) {
        let dChannel = dClient.channels.cache.find(channel => channel.name === config.channel);

        for (let i = 0; i < config.twitchChannels.length; i++) {
            tClient.say(`#${config.twitchChannels[i]}`, config.guessIntro);
        }

        dChannel.send(config.guessIntro);
    }
};