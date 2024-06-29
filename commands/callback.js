'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandCallback extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'callback';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.TWITCH) {
            result = "Twitch must be origination of command";
        } else if (!context.activeRace.started) {
            result = "Race has not started";
        } else if (context.activeRace.finished) {
            result = "Race has finished";
        } else if (context.activeRace.lastCallback &&
            (Math.floor((Date.now() - context.activeRace.lastCallback)) / 1000) <= this._app.config['minimumNewCallbackSeconds']) {
            result = "Callback in cooldown";
        }

        return result;
    }

    executeCommand(context) {
        context.activeRace.lastCallback = Date.now();

        let time = context.activeRace.lastCallback - context.activeRace.startedAt;
        if (time < 0) {
            time = 0;
        }

        let message = `${this._app.routines['getRaceTime'](time)}, go back to ${context.messageChannel.replace('#', '')}'s stream.`

        this._app.routines['broadcastMessage'](this._app, context, message, true, false);

        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}