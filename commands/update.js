'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandUpdate extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'update';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               context.activeRace.started &&
               this._app.config['referees'].includes(context.userId);
    }

    executeCommand(context) {
        this._app.routines['updateRaceMessage'](this._app, context);
    }
}