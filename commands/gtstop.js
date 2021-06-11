'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandGTStop extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'gtstop';
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
        context.activeRace.guessGameFinished = true;
        let message = `${this._app.config[context.activeRace.ladder ? 'gtLadderPrefix' : 'gtRacePrefix']} ${this._app.config['gtStopMessage']}`
        context.twitchClient.say(context.messageChannel, message).then().catch(console.error);
        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}