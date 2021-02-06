const updateRaceMessage = require('../common/updateRaceMessage');
const data = require('../data/data.js');

module.exports = (race, channel) => {
    data.setSpaceballs(Date.now() + 3600000);
    channel.send("Reset the clock!");
    if (race.initiatedAt) updateRaceMessage(race, channel);
};