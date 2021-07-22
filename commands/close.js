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
        return context.origination === this._app.DISCORD &&
               this._app.config['referees'].includes(context.username);
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