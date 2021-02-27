const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, race, dChannel, message) => {
    if (race.escapeItem) return;

    let match = message.content.match(/^[.!](\bescape\b) ([a-zA-Z0-9<>:]{4,100})/i);

    if (race.started && match.length > 2) {
        race.escapeItem = `${match[2]}`;
        updateRaceMessage(race, dChannel);
    }
};