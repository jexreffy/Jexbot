const broadcastMessage = require('../common/broadcastMessage');

module.exports = (config, race, dChannel, tClient) => {
    if (race.guesses[race.gtbk - 1]) {
        race.gtbkWinner = race.guesses[race.gtbk - 1];
        race.gtbkGuess = race.gtbk;
        broadcastMessage(config, dChannel, tClient, `${race.guesses[i]} on ${race.gtRunner.replace('#', '')}'s stream guessed ${i + 1} correctly guessed ${race.gtbk}. Congratulations!`, true);
        return;
    }

    for (let i = race.gtbk - 1; i >= 0; i--) {
        if (race.guesses[i]) {
            race.gtbkWinner = race.guesses[i];
            race.gtbkGuess = i + 1;
            broadcastMessage(config, dChannel, tClient, `${race.guesses[i]} on ${race.gtRunner.replace('#', '')}'s stream guessed ${i + 1} and was the closest to the correct answer of ${race.gtbk}. Congratulations!`, true);
            return;
        }
    }

    for (let i = race.gtbk; i < race.guesses; i++) {
        if (race.guesses[i]) {
            race.gtbkWinner = race.guesses[i];
            race.gtbkGuess = i + 1;
            broadcastMessage(config, dChannel, tClient, `${race.guesses[i]} on ${race.gtRunner.replace('#', '')}'s stream guessed ${i + 1} and was the closest to the correct answer of ${race.gtbk}. Congratulations!`, true);
            return;
        }
    }
}