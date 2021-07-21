'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandUnready extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'unready';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               !context.activeRace.started &&
               context.activeRace.players.find(x => x.username === context.username) !== undefined;
    }

    executeCommand(context) {
        let player = context.activeRace.players.find(x => x.username === context.username);
        player.ready = false;
        this._app.db.setRaceData(context.guildId, context.activeRace);

        this._app.routines['updateRaceMessage'](this._app, context);
    }
}