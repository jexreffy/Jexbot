'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandRestream extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'restream';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (context.activeRace.started) {
            result = "Current race has started";
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
        let match = context.message.match(/^[.!](\brestream\b) ((\bon\b)|(\boff\b))/i);

        if (!match || match.length <= 2) return;

        let isRestream = match[3] === 'on';

        context.activeRace.restream = isRestream ? this._app.config['guilds'][context.guildId]['restreamChannel'] : null;

        this._app.db.setRaceData(context.guildId, context.activeRace);
        this._app.routines['updateRaceMessage'](this._app, context);
    }
}