const gtbkWinner = require('../common/gtbkWinner');

module.exports = (config, race, dChannel, tClient, tChannel, message) => {
    if (!config.categories[race.category].gtbk || !race.guessGameStarted || race.gtbk >= 0) return;

    let match = message.match(/^[.!](\bgtbk\b) ([0-9]{1,2})/i);
    let guess = parseInt(match[2]);

    if (race.ladder || race.invitational) {
        race.gtbk = guess;
        race.gtRunner = "TheCrystalCompany";

        gtbkWinner(config, race, null, tClient);
    } else if (race.gtRunner !== null) {
        let response = config.gtGuessFound.replace('LOCATION', guess);

        if (tClient) tClient.say(tChannel, response).then().catch(console.error);

        let player = race.players.find(x => x.twitch === tChannel);

        if ((tChannel.toLowerCase() === race.restream.toLowerCase() && race.gtRunner === race.restream.toLowerCase()) ||
            (player && race.gtRunner && race.gtRunner === player.twitch)) {
            race.gtbk = guess;

            if (race.spoilersAllowed) {
                gtbkWinner(config, race, dChannel, tClient);
            }
        }
    }
}