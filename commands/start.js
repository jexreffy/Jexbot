'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandStart extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'start';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               !context.activeRace.started &&
               context.activeRace.gatekeeper === context.username;
    }

    executeCommand(context) {
        this._app.routines['startRace'](this._app, context);
    }
}