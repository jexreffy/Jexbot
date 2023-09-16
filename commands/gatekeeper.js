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
        return context.origination === this._app.DISCORD &&
               !context.activeRace.started &&
               this._app.config['referees'].includes(context.userId);
    }

    executeCommand(context) {
        context.activeRace.gatekeeper = context.userId;
        this._app.db.setRaceData(context.guildId, context.activeRace);

        this._app.routines['updateRaceMessage'](this._app, context);
    }
}