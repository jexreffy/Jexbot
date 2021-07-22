'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandDisconnect extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'disconnect';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               this._app.config['referees'].includes(context.username);
    }

    executeCommand(context) {
        context.activeRace.connected = false;
        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}