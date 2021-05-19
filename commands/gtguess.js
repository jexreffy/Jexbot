const broadcastMessage = require('../common/broadcastMessage');

module.exports = (config, race, dChannel, tClient, tChannel, username, message) => {
    if (!config.categories[race.category].gtbk || !race.guessGameStarted) return;

    let match = message.match(/^[.!](\bgtguess\b) ([0-9]{1,2})/i);
    let guess = parseInt(match[2]);

    if (guess < 1 || guess > 22) return;

    let response = null;

    for (let i = 0; i < race.guesses.length; i++) {
        if (race.guesses[i] === username) {
            response = `${race.guesses[i]} has already guessed ${i + 1} for the GTBK Guessing Game.`;
            if (tClient && tChannel) {
                tClient.say(tChannel, response).then().catch(console.error);
            } else if (!race.invitational) {
                dChannel.send(`**${response}**`).then().catch(console.error);
            }

            return;
        }
    }

    if (race.guesses[guess - 1]) {
        response = `${race.guesses[guess - 1]} has already guessed ${guess} for the GTBK Guessing Game.`;

        if (tClient && tChannel) {
            tClient.say(tChannel, response).then().catch(console.error);
        } else if (!race.invitational) {
            dChannel.send(`**${response}**`).then().catch(console.error);
        }
    } else {
        race.guesses[guess - 1] = username;
        response = `${username} has guessed ${guess} for the GTBK Guessing Game.`;

        if (race.ladder || race.invitational) {
            tClient.say(tChannel, response).then().catch(console.error);
        } else {
            broadcastMessage(config, dChannel, tClient, response, true);
        }
    }
};