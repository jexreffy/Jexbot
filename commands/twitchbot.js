const data = require('../data/data.js');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (race, dChannel, message, username) => {
    let match = message.content.match(/^[.!](\btwitchbot\b) ((\bon\b)|(\boff\b))/i);
    let isStreaming = match[3] === "on";

    let player = race.players.find(x => x.username === username);
    if (player) {
        data.setPlayerTwitchBot(username, isStreaming);

        updateRaceMessage(race, dChannel);
    } else {
        data.setPlayerTwitchBot(username, isStreaming);
    }
};