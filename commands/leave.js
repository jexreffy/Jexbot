'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandLeave extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'leave';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (context.activeRace.locked) {
            result = "Race has been locked";
        } else if (context.activeRace.started) {
            result = "Race is currently in progress";
        } else if (context.activeRace.players.find(x => x.discordId === context.userId) === undefined) {
            result = "User is not in the race";
        }

        return result;
    }

    executeCommand(context) {
        let player = context.activeRace.players.find(x => x.discordId === context.userId);
        this._app.routines['onRunnerRemoved'](this._app, context, player);

        let allReady = context.activeRace.players.every(x => x.ready === true);
        if (!context.activeRace.gatekeeper && allReady && context.activeRace.players.length > 1) {
            if (context.activeRace.teams) {
                context.activeRace.teams = false;
                context.activeRace.players[0].ready = false;
                this._app.routines['updateRaceMessage'](this._app, context);
            } else {
                this._app.routines['startRace'](this._app, context);
            }
        } else {
            context.activeRace.teams = false;
            this._app.routines['updateRaceMessage'](this._app, context);
        }

        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}