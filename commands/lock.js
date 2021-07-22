'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandLock extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'lock';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               !context.activeRace.started &&
               this._app.config['referees'].includes(context.username);
    }

    executeCommand(context) {
        context.activeRace.locked = true;
        context.activeRace.status = 'SIGNUPS CLOSED: WAITING FOR PLAYERS TO READY UP';
        this._app.db.setRaceData(context.guildId, context.activeRace);
        this._app.routines['updateRaceMessage'](this._app, context);
    }
}