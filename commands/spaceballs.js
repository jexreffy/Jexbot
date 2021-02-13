const updateRaceMessage = require('../common/updateRaceMessage');
const data = require('../data/data.js');

module.exports = (race, channel) => {
    data.setSpaceballs(Date.now() + 3600000);
    if (race.initiatedAt) updateRaceMessage(race, channel);
};