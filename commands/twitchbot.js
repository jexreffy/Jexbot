const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (db, race, dChannel, message, username) => {
    let match = message.content.match(/^[.!](\btwitchbot\b) ((\bon\b)|(\boff\b))/i);
    let isStreaming = match[3] === "on";

    let player = race.players.find(x => x.username === username);
    if (player) {
        db.setPlayerTwitchBot(username, isStreaming);

        updateRaceMessage(db, race, dChannel);
    } else {
        db.setPlayerTwitchBot(username, isStreaming);
    }
};