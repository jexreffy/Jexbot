'use strict'
module.exports = (app, context) => {
    let response = null;

    if (context.activeRace.guesses[context.activeRace.gtbk - 1]) {
        context.activeRace.gtbkWinner = context.activeRace.guesses[context.activeRace.gtbk - 1];
        context.activeRace.gtbkGuess = context.activeRace.gtbk;
        response = `${context.activeRace.gtbkWinner} correctly guessed ${context.activeRace.gtbk}. Congratulations!`;
    }

    if (!response) {
        for (let i = context.activeRace.gtbk - 1; i >= 0; i--) {
            if (context.activeRace.guesses[i]) {
                context.activeRace.gtbkWinner = context.activeRace.guesses[i];
                context.activeRace.gtbkGuess = i + 1;
                response = `${context.activeRace.gtbkWinner} guessed ${context.activeRace.gtbkGuess} and was the closest to the correct answer of ${context.activeRace.gtbk}. Congratulations!`;
                break;
            }
        }
    }

    if (!response) {
        for (let i = context.activeRace.gtbk; i < context.activeRace.guesses; i++) {
            if (context.activeRace.guesses[i]) {
                context.activeRace.gtbkWinner = context.activeRace.guesses[i];
                context.activeRace.gtbkGuess = i + 1;
                response = `${context.activeRace.gtbkWinner} guessed ${context.activeRace.gtbkGuess} and was the closest to the correct answer of ${context.activeRace.gtbk}. Congratulations!`;
                break;
            }
        }
    }

    if (response) app.routines['broadcastMessage'](app, context, response, true);
}