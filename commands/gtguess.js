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
        return context.origination === this._app.TWITCH &&
            context.activeRace.guessGameEnabled &&
            context.activeRace.guessGameStarted;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bgtguess\b) ([0-9]{1,2})/i);
        let guess = parseInt(match[2]);

        if (guess < 1 || guess > 22) return;

        let response = null;

        for (let i = 0; i < context.activeRace.guesses.length; i++) {
            if (context.activeRace.guesses[i] === context.username) {
                response = `${context.activeRace.guesses[i]} has already guessed ${i + 1} for the GTBK Guessing Game.`;
                if (context.origination === this._app.TWITCH) {
                    this._app.sendToTwitchChannel(context.guildId, context.messageChannel, response).then().catch(console.error);
                } else if (context.origination === this._app.DISCORD &&
                           !context.activeRace.invitational) {
                    this._app.sendToDiscordRaceChannel(context.guildId, `**${response}**`).then().catch(console.error);
                }
                return;
            }
        }

        if (context.activeRace.guesses[guess - 1]) {
            response = `${context.activeRace.guesses[guess - 1]} has already guessed ${guess} for the GTBK Guessing Game.`;

            if (context.origination === this._app.TWITCH) {
                this._app.sendToTwitchChannel(context.guildId, context.messageChannel, response).then().catch(console.error);
            }  else if (context.origination === this._app.DISCORD &&
                        !context.activeRace.invitational) {
                this._app.sendToDiscordRaceChannel(context.guildId, `**${response}**`).then().catch(console.error);
            }
        } else {
            context.activeRace.guesses[guess - 1] = context.username;
            response = `${context.username} has guessed ${guess} for the GTBK Guessing Game.`;

            if (context.activeRace.ladder || context.activeRace.invitational) {
                this._app.sendToTwitchChannel(context.guildId, context.messageChannel, response).then().catch(console.error);
            } else {
                this._app.routines['broadcastMessage'](this._app, context, response, true);
            }
            this._app.db.setRaceData(context.guildId, context.activeRace);
        }
    }
}