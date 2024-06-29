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
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (context.activeRace.started) {
            result = "Current race has started";
        } else if (context.activeRace.gatekeeper !== context.userId) {
            result = "User is not the gatekeeper";
        }

        return result;
    }

    executeCommand(context) {
        this._app.routines['startRace'](this._app, context);
    }
}