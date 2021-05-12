module.exports = (config, race, tClient, tChannel) => {
    if (tClient) {
        let message = config.runnerMessage + " ";

        for (let i = 0; i < race.players.length; i++) {
            message += `https://twitch.tv/${race.players[i].twitch}${i !== race.players.length - 1 ? ' ' : ''}`;
        }

        tClient.say(tChannel, message).then().catch(console.error);
    }
};