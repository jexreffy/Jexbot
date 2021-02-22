module.exports = (config, race, tClient, tChannel) => {
    if (!race.guessGameStarted) return;

    tClient.say(tChannel, config.gtGuessEnter).then().catch(console.error);

    if (race.gtRunner) return;

    let player = race.players.find(x => x.twitch === tChannel);

    if (player) {
        race.gtRunner = tChannel;
    }
}