module.exports = (config, race, tClient, tChannel) => {
    if (tClient) {
        let message = config.runnerMessage + " ";

        for (let i = 0; i < race.players.length; i++) {
            if ((race.teams && i === 0) || (race.teams && i > 0 && race.players[i - 1].team < race.players[i].team)) {
                message += `Team ${race.players[i].team + 1}: `;
            }

            if (race.players[i].twitch) {
                message += `https://twitch.tv/${race.players[i].twitch.substr(1)}${i !== race.players.length - 1 ? ' ' : ''}`;
            } else {
                message += `https://twitch.tv/${race.players[i].username}${i !== race.players.length - 1 ? ' ' : ''}`;
            }
        }

        tClient.say(tChannel, message).then().catch(console.error);
    }
};