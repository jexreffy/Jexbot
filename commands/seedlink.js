'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandSeedLink extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'seedlink';
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
        } else if (!context.activeRace.relay && context.activeRace.seedLink) {
            result = "Seed Code has already been set";
        } else if (context.activeRace.relay && context.activeRace.legs[context.activeRace.legs - 1].link) {
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
        let match = context.message.match(/^[.!](\bseedlink\b) ("https:\/\/[a-zA-Z0-9_%\/?,.=]{4,100}")/i);
        console.log(match);

        if (!match || match.length <= 2) {
            match = context.message.match(/^[.!](\bseedlink\b) ("http:\/\/[a-zA-Z0-9_%\/?,.=]{4,100}")/i);
            console.log(match);

            if (!match || match.length <= 2) return;
        }

        let link = match[2].replace(/"/ig, '');

        if (context.activeRace.relay) {
            context.activeRace.legs[context.activeRace.legs.length - 1].link = link;
        } else {
            context.activeRace.seedLink = link;
        }

        this._app.db.setRaceData(context.guildId, context.activeRace);

        this._app.routines['updateRaceMessage'](this._app, context);
    }
}