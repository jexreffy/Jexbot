const config = require('../config.json');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (race, dChannel, tClient, tChannel) => {
    if (race.started) {
        race.dickCount += 1;
        if (race.initiatedAt) {
            updateRaceMessage(race, dChannel);
        }

        let dickMessage = config.dickMessages[Math.floor(Math.random() * Math.floor(config.dickMessages.length))].replace('RICHARD', race.dickCount);

        for (let i = 0; i < config.twitchChannels.length; i++) {
            tClient.say(tChannel, `${race.seedRoller} ${dickMessage}`);
        }
    }
};