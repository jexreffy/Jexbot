'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandSeedCode extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'seedcode';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (context.activeRace.started) {
            result = "Current race has not finished";
        } else if (!context.activeRace.relay && context.activeRace.seedCode) {
            result = "Seed Code has already been set";
        } else if (context.activeRace.relay && context.activeRace.legs[context.activeRace.legs - 1].code) {
            result = "Seed Code has already been set";
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
        let match = context.message.match(/^[.!](\bseedcode\b) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100})/i);

        if (!match || match.length <= 6) return;

        let code = `<${match[2]}><${match[3]}><${match[4]}><${match[5]}><${match[6]}>`;

        if (context.activeRace.relay) {
            context.activeRace.legs[context.activeRace.legs - 1].code = code;
        } else {
            context.activeRace.seedLink = code;
        }

        this._app.db.setRaceData(context.guildId, context.activeRace);

        this._app.routines['updateRaceMessage'](this._app, context);
    }
}