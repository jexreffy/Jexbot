const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, username, message) => {
    if (race.seedLink) return;

    let player = race.players.find(x => x.username === username);
    let match = message.content.match(/^[.!](\bmultiworld\b) (https:\/\/[a-zA-Z0-9_%\/?,.]{4,200})/i);
    let seed = match[2];

    if (!race.started && (player || config.referees.includes(username))) {
        race.seedRoller = "Multiworld";
        race.seedLink = seed;
        race.seedCode = "N/A";
        updateRaceMessage(db, race, dChannel);
    }
}