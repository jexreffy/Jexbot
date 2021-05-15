const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (db, race, dChannel, message, username) => {
    let match = message.content.match(/^[.!](\btwitch\b) ([a-zA-Z0-9_]{4,20})/i);
    let stream = match[2];

    let player = race.players.find(x => x.username === username);
    if (player) {
        let userTwitch = data.getPlayerTwitch(username);
        if (!userTwitch) {
            userTwitch = username;
        }

        player.twitch = `#${username}`;

        race.mutlistream = race.mutlistream.replace(new RegExp(userTwitch + '/', 'i'), "");

        db.setPlayerTwitch(username, stream);

        if (db.getPlayerStreaming(username)) race.mutlistream += stream + '/';

        updateRaceMessage(db, race, dChannel);
    } else {
        db.setPlayerTwitch(username, stream);
    }
};