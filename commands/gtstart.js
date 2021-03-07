module.exports = (config, race, tClient, tChannel) => {
    if (!race.ladder || !config.categories[race.category].gtbk || race.guessGameStarted) return;

    race.guessGameStarted = true;
    if (tClient) tClient.say(tChannel, config.gtStartMessage).then().catch(console.error);
}