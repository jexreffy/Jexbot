const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (race, channel) => {
    if (race.started) {
        race.dickCount += 1;
        if (race.initiatedAt) updateRaceMessage(race, channel);
    }
};