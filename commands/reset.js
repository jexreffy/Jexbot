'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandReset extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'reset';
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
        context.activeRace.started = false;
        context.activeRace.startedAt = null;
        context.activeRace.initiatedAt = Date.now();
        context.activeRace.remainingPlayers = context.activeRace.players.length;
        context.activeRace.players.forEach(x => {
            x.finished = false;
            x.forfeited = false;
            x.ready = false;
            x.time = null;
        });
        context.activeRace.status = 'RESTARTED PRE-RACE: WAITING FOR PLAYERS TO JOIN';
        this._app.db.setRaceData(context.guildId, context.activeRace);
        this._app.routines['updateRaceMessage'](this._app, context);
    }
}