'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandConnect extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'connect';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               this._app.config['referees'].includes(context.username);
    }

    executeCommand(context) {
        context.activeRace.connected = true;
        context.activeRace.lastHello = Date.now() - (this._app.config['helloInterval'] * 1000) + 10000;
        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}