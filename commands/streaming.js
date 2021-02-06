const data = require('../data/data.js');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (race, channel, message, username) => {
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

        updateRaceMessage(race, channel);
    } else {
        data.setPlayerTwitch(username, isStreaming);
    }
};