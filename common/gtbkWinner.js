const broadcastMessage = require('../common/broadcastMessage');

module.exports = (config, race, dChannel, tClient) => {
    let response = null

    if (race.guesses[race.gtbk - 1]) {
        race.gtbkWinner = race.guesses[race.gtbk - 1];
        race.gtbkGuess = race.gtbk;
        response = `${race.gtbkWinner} correctly guessed ${race.gtbk}. Congratulations!`;
    }

    if (!response) {
        for (let i = race.gtbk - 1; i >= 0; i--) {
            if (race.guesses[i]) {
                race.gtbkWinner = race.guesses[i];
                race.gtbkGuess = i + 1;
                response = `${race.gtbkWinner} guessed ${race.gtbkGuess} and was the closest to the correct answer of ${race.gtbk}. Congratulations!`;
                break;
            }
        }
    }

    if (!response) {
        for (let i = race.gtbk; i < race.guesses; i++) {
            if (race.guesses[i]) {
                race.gtbkWinner = race.guesses[i];
                race.gtbkGuess = i + 1;
                response = `${race.gtbkWinner} guessed ${race.gtbkGuess} and was the closest to the correct answer of ${race.gtbk}. Congratulations!`;
                break;
            }
        }
    }

    if (response) broadcastMessage(config, dChannel, tClient, response, true);
}