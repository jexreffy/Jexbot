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
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (!context.activeRace.started) {
            result = "Race has not started";
        } else if (!this._app.config['referees'].includes(context.userId)) {
            result = "User is not allowed to be gatekeeper";
        }

        return result;
    }

    executeCommand(context) {
        this._app.routines['updateRaceMessage'](this._app, context);
    }
}