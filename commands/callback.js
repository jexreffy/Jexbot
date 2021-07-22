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
        return context.origination === this._app.TWITCH &&
               context.activeRace.started &&
               !context.activeRace.finished &&
               (!context.activeRace.lastCallback ||
                   (Math.floor((Date.now() - context.activeRace.lastCallback)) / 1000) > this._app.config['minimumNewCallbackSeconds']);
    }

    executeCommand(context) {
        context.activeRace.lastCallback = Date.now();

        let time = context.activeRace.lastCallback - context.activeRace.startedAt;
        if (time < 0) {
            time = 0;
        }

        let message = `${this._app.routines['getRaceTime'](time)}, go back to ${context.messageChannel.replace('#', '')}'s stream.`

        this._app.routines['broadcastMessage'](this._app, context, message, true);

        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}