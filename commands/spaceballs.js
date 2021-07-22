'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandSpaceBalls extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'spaceballs';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return (Math.floor((Date.now() - this._app.db.getSpaceballs())) / 1000) > this._app.config['minimumNewSpaceballsSeconds'];
    }

    executeCommand(context) {
        this._app.db.setSpaceballs(Date.now());
        if (!context.activeRace.ladder && context.activeRace.initiatedAt) {
            this._app.routines['updateRaceMessage'](this._app, context);
        }

        this._app.routines['broadcastMessage'](this._app, context, this._app.config['spaceballsClock'], true);
    }
}