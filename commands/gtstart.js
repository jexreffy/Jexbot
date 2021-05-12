module.exports = (config, race, tClient, tChannel) => {
    if (!config.categories[race.category].gtbk || race.guessGameStarted) return;

    race.guessGameStarted = true;
    if (tClient) tClient.say(tChannel, `${race.ladder ? config.gtLadderPrefix : config.gtRacePrefix} ${config.gtStartMessage}`).then().catch(console.error);
}