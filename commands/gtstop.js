module.exports = (config, race, tClient, tChannel) => {
    if (!race.guessGameEnabled || race.guessGameFinished) return;

    race.guessGameFinished = true;
    if (tClient) tClient.say(tChannel, `${race.ladder ? config.gtLadderPrefix : config.gtRacePrefix} ${config.gtStopMessage}`).then().catch(console.error);
}