'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandKick extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'kick';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               !context.activeRace.finished &&
               this._app.config['referees'].includes(context.username);
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bkick\b) ([a-zA-Z0-9%]{0,20})/i);
        let player = context.activeRace.players.find(x => x.username === match[3]);

        if (!context.activeRace.finished && player) {
            this._app.routines['onRunnerRemoved'](this._app, context, player);

            let allReady = context.activeRace.players.every(x => x.ready === true);
            if (!context.activeRace.started && !context.activeRace.gatekeeper && allReady && context.activeRace.players.length > 1) {
                if (context.activeRace.teams) {
                    context.activeRace.teams = false;
                    context.activeRace.players[0].ready = false;
                    this._app.routines['updateRaceMessage'](this._app, context);
                } else {
                    this._app.routines['startRace'](this._app, context);
                }
            } else if (context.activeRace.started) {
                player.forfeited = true;
                this._app.routines['onRunnerFinished'](this._app, context, player);
            } else if (!context.activeRace.started) {
                context.activeRace.teams = false;
                this._app.routines['updateRaceMessage'](this._app, context);
            }
        }

        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}