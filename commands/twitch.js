const data = require('../data/data.js');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (race, channel, message, username) => {
    let match = message.content.match(/^[.!](\btwitch\b) ([a-zA-Z0-9_]{4,20})/i);
    let stream = match[2];

    let player = race.players.find(x => x.username === username);
    if (player) {
        let userTwitch = data.getPlayerTwitch(username);
        if (!userTwitch) {
            userTwitch = username;
        }

        race.mutlistream = race.mutlistream.replace(new RegExp(userTwitch + '/', 'i'), "");

        data.setPlayerTwitch(username, stream);

        if (data.getPlayerStreaming(username)) race.mutlistream += stream + '/';

        updateRaceMessage(race, channel);
    } else {
        data.setPlayerTwitch(username, stream);
    }
};