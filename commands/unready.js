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
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (context.activeRace.started) {
            result = "Race is currently in progress";
        } else if (context.activeRace.players.find(x => x.discordId === context.userId) === undefined) {
            result = "User is not in the database";
        }

        return result;
    }

    executeCommand(context) {
        let player = context.activeRace.players.find(x => x.discordId === context.userId);
        player.ready = false;
        this._app.db.setRaceData(context.guildId, context.activeRace);

        this._app.routines['updateRaceMessage'](this._app, context);
    }
}