'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandGTStop extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'gtstart';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.TWITCH) {
            result = "Twitch must be origination of command";
        } else if (!context.activeRace.started) {
            result = "Current race has not started";
        } else if (context.activeRace.finished) {
            result = "Current race has finished";
        } else if (!context.activeRace.guessGameEnabled) {
            result = "GTBK Guessing Game is not enabled for this race";
        } else if (!context.activeRace.guessGameStarted) {
            result = "GTBK Guessing Game has not started";
        }

        return result;
    }

    executeCommand(context) {
        context.activeRace.guessGameStarted = true;
        let message = `${this._app.config[context.activeRace.ladder ? 'gtLadderPrefix' : 'gtRacePrefix']} ${this._app.config['gtStartMessage']}`
        this._app.sendToTwitchChannel(context.guildId, context.messageChannel, message).then().catch(console.error);
        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}