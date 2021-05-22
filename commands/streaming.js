const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (db, race, dChannel, message, username) => {
    let match = message.content.match(/^[.!](\bstreaming\b) ((\bon\b)|(\boff\b))/i);
    let isStreaming = match[3] === "on";

    let player = race.players.find(x => x.username === username);
    if (player) {
        db.setPlayerStreaming(username, isStreaming);

        let userTwitch = db.getPlayerTwitch(username);
        if (!userTwitch) {
            userTwitch = username;
        }

        race.mutlistream = race.mutlistream.replace(new RegExp(userTwitch + '/', 'i'), "");

        if (isStreaming) race.mutlistream += userTwitch + '/';

        updateRaceMessage(db, race, dChannel);
    } else {
        db.setPlayerStreaming(username, isStreaming);
    }
};