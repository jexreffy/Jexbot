module.exports = (config, race, tClient, tChannel) => {
    console.log(tChannel);
    if (race.ladder || race.invitational || !config.categories[race.category].gtbk || !race.guessGameStarted) return;

    if (race.gtRunner) return;

    if (tClient) tClient.say(tChannel, config.gtGuessEnter).then().catch(console.error);

    let player = race.players.find(x => x.twitch === tChannel);

    if (tChannel.toLowerCase() === race.restream.toLowerCase() || player) {
        race.gtRunner = tChannel;
    }
}