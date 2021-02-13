const updateRaceMessage = require('../common/updateRaceMessage');
const config = require('../config.json');

module.exports = (race, channel, username, message) => {
    if (race.seedLink) return;

    let player = race.players.find(x => x.username === username);
    let match = message.content.match(/^[.!](\bsetseedlink\b) (https:\/\/[a-zA-Z0-9_%\/?,.]{4,70})/i);
    let seed = match[2];

    if (!race.started && (player || config.referees.includes(username))) {
        race.seedRoller = username;
        race.seedLink = seed;
        updateRaceMessage(race, channel);
    }
};