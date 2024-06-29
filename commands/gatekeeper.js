'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandGatekeeper extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'gatekeeper';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (context.activeRace.started) {
            result = "Race is currently in progress";
        } else if (!this._app.config['referees'].includes(context.userId)) {
            result = "User is not allowed to be gatekeeper";
        }

        return result;
    }

    executeCommand(context) {
        context.activeRace.gatekeeper = context.userId;
        context.activeRace.gatekeeperDisplayName = context.displayName;
        this._app.db.setRaceData(context.guildId, context.activeRace);

        this._app.routines['updateRaceMessage'](this._app, context);
    }
}