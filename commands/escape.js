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
        return context.origination === this._app.DISCORD &&
               !context.activeRace['escapeItem'] &&
               context.activeRace.started;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bescape\b) ([a-zA-Z0-9<>:]{4,100})/i);

        if (match.length > 2) {
            context.activeRace.escapeItem = `${match[2]}`;
            this._app.db.setRaceData(context.guildId, context.activeRace);
            this._app.routines['updateRaceMessage'](this._app, context);
        }
    }
}