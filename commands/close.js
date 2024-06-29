'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandClose extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'close';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (!this._app.config['referees'].includes(context.userId)) {
            result = "User is not allowed to be gatekeeper";
        }

        return result;
    }

    executeCommand(context) {
        context.activeRace.finished = true;
        context.activeRace.status = 'RACE CLOSED';
        this._app.db.setRaceData(context.guildId, context.activeRace);

        if (!context.activeRace.ladder) {
            this._app.routines['updateRaceMessage'](this._app, context);
        }
    }
}