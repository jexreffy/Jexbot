const data = require('../data/data.js');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (race, dChannel, message, username) => {
    let match = message.content.match(/^[.!](\bstreaming\b) ((\bon\b)|(\boff\b))/i);
    let isStreaming = match[3] === "on";

    let player = race.players.find(x => x.username === username);
    if (player) {
        data.setPlayerStreaming(username, isStreaming);

        let userTwitch = data.getPlayerTwitch(username);
        if (!userTwitch) {
            userTwitch = username;
        }

        race.mutlistream = race.mutlistream.replace(new RegExp(userTwitch + '/', 'i'), "");

        if (isStreaming) race.mutlistream += userTwitch + '/';

        updateRaceMessage(race, dChannel);
    } else {
        data.setPlayerStreaming(username, isStreaming);
    }
};