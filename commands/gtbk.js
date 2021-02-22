module.exports = (config, race, tClient, tChannel, message) => {
    if (!race.guessGameStarted) return;

    let match = message.match(/^[.!](\bgtbk\b) ([0-9]{1,2})/i);
    let guess = parseInt(match[2]);
    let response = config.gtGuessFound.replace('LOCATION', guess);

    tClient.say(tChannel, response).then().catch(console.error);

    let player = race.players.find(x => x.twitch === tChannel);

    if (player && race.gtRunner && race.gtRunner === player.twitch && race.gtbk < 0) {
        race.gtbk = guess;
    }
}