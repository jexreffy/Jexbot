const config = require('../config.json');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (race, dChannel, tClient) => {
    let lastTime = race.lastDickTime;
    if ((Math.floor(((new Date().getTime()) - lastTime)) / 1000) > config.minimumNewDickSeconds) {
        if (race.started) {
            race.dickCount += 1;
            race.lastDickTime = Date.now();

            if (race.initiatedAt) {
                updateRaceMessage(race, dChannel);
            }

            let dickMessage = config.dickMessages[Math.floor(Math.random() * Math.floor(config.dickMessages.length))].replace('RICHARD', race.dickCount);

            for (let i = 0; i < config.twitchChannels.length; i++) {
                tClient.say(`#${config.twitchChannels[i]}`, `${race.seedRoller} ${dickMessage}`);
            }
        }
    }
};