module.exports = (config, race, tClient, tChannel) => {
    if (!config.categories[race.category].gtbk || race.guessGameFinished) return;

    race.guessGameFinished = true;
    if (tClient) tClient.say(tChannel, `${race.ladder ? config.gtLadderPrefix : config.gtRacePrefix} ${config.gtStopMessage}`).then().catch(console.error);
}