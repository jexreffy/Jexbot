'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandEscape extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'escape';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (!context.activeRace.started) {
            result = "Current race has not started";
        } else if (context.activeRace.finished) {
            result = "Current race has finished";
        } else if (context.activeRace.escapeItem) {
            result = "Escape Item has already been set";
        }

        return result;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bescape\b) ([a-zA-Z0-9<>:]{4,100})/i);

        if (!match || match.length <= 2) return;

        context.activeRace.escapeItem = `${match[2]}`;
        this._app.db.setRaceData(context.guildId, context.activeRace);
        this._app.routines['updateRaceMessage'](this._app, context);
    }
}