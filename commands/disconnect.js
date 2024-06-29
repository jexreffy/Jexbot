'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandDisconnect extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'disconnect';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
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
        context.activeRace.connected = false;
        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}