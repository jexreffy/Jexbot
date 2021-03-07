module.exports = (config, race, tClient, tChannel, message) => {
    if (!config.categories[race.category].gtbk || !race.guessGameStarted || race.gtbk >= 0) return;

    let match = message.match(/^[.!](\bgtbk\b) ([0-9]{1,2})/i);
    let guess = parseInt(match[2]);

    if (race.ladder) {
        race.gtbk = guess;
        const gtbkWinner = require('../common/gtbkWinner');
        gtbkWinner(config, race, null, tClient);
    } else {
        let response = config.gtGuessFound.replace('LOCATION', guess);

        if (tClient) tClient.say(tChannel, response).then().catch(console.error);

        let player = race.players.find(x => x.twitch === tChannel);

        if (player && race.gtRunner && race.gtRunner === player.twitch) {
            race.gtbk = guess;
        }
    }

}