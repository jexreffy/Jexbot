module.exports = (config, race, tClient, tChannel) => {
    if (!race.ladder || !config.categories[race.category].gtbk || race.guessGameFinished) return;

    race.guessGameFinished = true;
    if (tClient) tClient.say(tChannel, config.gtStopMessage).then().catch(console.error);
}