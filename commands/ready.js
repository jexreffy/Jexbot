'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandReady extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'ready';
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
        player.ready = true;

        this._app.db.setRaceData(context.guildId, context.activeRace);

        let allReady = context.activeRace.players.every(x => x.ready === true);
        if (!context.activeRace.gatekeeper && allReady && context.activeRace.players.length > 1) {
            this._app.routines['startRace'](this._app, context);
        } else {
            this._app.routines['updateRaceMessage'](this._app, context);
        }
    }
}