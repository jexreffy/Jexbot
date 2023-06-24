'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandGTStop extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'gtguess';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.activeRace.started &&
               !context.activeRace.finished &&
               context.activeRace.guessGameEnabled &&
               context.activeRace.guessGameStarted &&
               !context.activeRace.guessGameFinished &&
               (!(context.activeRace.ladder || context.activeRace.invitational) ||
                   context.origination === this._app.TWITCH);
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bgtguess\b) ([0-9]{1,2})/i);

        if (!match) return;

        let guess = parseInt(match[2]);

        if (guess < 1 || guess > 22) return;

        let response = null;

        for (let i = 0; i < context.activeRace.guesses.length; i++) {
            if (context.activeRace.guesses[i] === context.displayName) {
                response = `${context.activeRace.guesses[i]} has already guessed ${i + 1} for the GTBK Guessing Game.`;
                break;
            }
        }

        if (!response && context.activeRace.guesses[guess - 1]) {
            response = `${context.activeRace.guesses[guess - 1]} has already guessed ${guess} for the GTBK Guessing Game.`;
        }

        if (response) {
            if (context.origination === this._app.TWITCH) {
                this._app.sendToTwitchChannel(context.guildId, context.messageChannel, response).then().catch(console.error);
            }  else if (context.origination === this._app.DISCORD) {
                this._app.sendToDiscordRaceChannel(context.guildId, `**${response}**`).then().catch(console.error);
            }
        } else {
            context.activeRace.guesses[guess - 1] = context.displayName;
            response = `${context.displayName} has guessed ${guess} for the GTBK Guessing Game.`;

            if (context.activeRace.ladder || context.activeRace.invitational) {
                this._app.sendToTwitchChannel(context.guildId, context.messageChannel, response).then().catch(console.error);
            } else {
                this._app.routines['broadcastMessage'](this._app, context, response, true, false);
            }
            this._app.db.setRaceData(context.guildId, context.activeRace);
        }
    }
}