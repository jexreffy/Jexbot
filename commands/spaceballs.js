const config = require('../config.json');
const updateRaceMessage = require('../common/updateRaceMessage');
const data = require('../data/data.js');

module.exports = (race, dChannel, tClient) => {
    let lastTime = data.getSpaceballs();
    if ((Math.floor(((new Date().getTime()) - lastTime)) / 1000) > config.minimumNewSpaceballsSeconds) {
        data.setSpaceballs(Date.now() + 3600000);
        if (race.initiatedAt) {
            updateRaceMessage(race, dChannel);
        }

        for (let i = 0; i < config.twitchChannels.length; i++) {
            tClient.say(`#${config.twitchChannels[i]}`, `Reset the Spaceballs clock!!`);
        }
    }
};