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
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (context.activeRace.finished) {
            result = "Current race has finished";
        } else {
            let refereeRole = this._app.getRefereeRole(context.guildId);
            let member = this._app.findDiscordMemberById(context.guildId, context.userId);
            let hasRole = member.roles.cache.some(x => x.name === refereeRole.name);

            if (!hasRole) {
                result = "User is not a referee";
            }
        }

        return result;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bkick\b) ([a-zA-Z0-9%]{0,20})/i);
        let player = context.activeRace.players.find(x => x.username === match[3]);

        if (player) {
            let allReady = context.activeRace.players.every(x => x.ready === true);
            if (context.activeRace.started) {
                player.forfeited = true;
                this._app.routines['onRunnerFinished'](this._app, context, player);
            } else if (!context.activeRace.started && !context.activeRace.gatekeeper && allReady && context.activeRace.players.length > 1) {
                this._app.routines['onRunnerRemoved'](this._app, context, player);
                if (context.activeRace.teams) {
                    context.activeRace.teams = false;
                    context.activeRace.players[0].ready = false;
                    this._app.routines['updateRaceMessage'](this._app, context);
                } else {
                    this._app.routines['startRace'](this._app, context);
                }
            } else if (!context.activeRace.started) {
                this._app.routines['onRunnerRemoved'](this._app, context, player);
                context.activeRace.teams = false;
                this._app.routines['updateRaceMessage'](this._app, context);
            }
        }

        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}