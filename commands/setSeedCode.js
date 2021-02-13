const updateRaceMessage = require('../common/updateRaceMessage');
const config = require('../config.json');

module.exports = (race, channel, username, message) => {
    if (race.seedCode) return;

    let player = race.players.find(x => x.username === username);
    let match = message.content.match(/^[.!](\bsetseedcode\b) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100})/i);

    if (!race.started && match.length > 6 && (player || config.referees.includes(message.author.username))) {
        race.seedCode = `<${match[2]}><${match[3]}><${match[4]}><${match[5]}><${match[6]}>`;
        updateRaceMessage(race, channel);
    }
};