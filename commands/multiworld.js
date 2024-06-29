'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandMultiWorld extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'multiworld';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (context.activeRace.seedLink) {
            result = "Current race has had a seed set";
        } else if (context.activeRace.started) {
            result = "Current race has started";
        } else {
            let refereeRole = this._app.getRefereeRole(context.guildId);
            let member = this._app.findDiscordMemberById(context.guildId, context.userId);
            let hasRole = member.roles.cache.some(x => x.name === refereeRole.name);

            if (!hasRole && context.activeRace.players.find(x => x.discordId !== context.userId)) {
                result = "Only Referees or Races can setup a multiworld.";
            }
        }

        return result;
    }

    executeCommand(context) {
        let match = message.content.match(/^[.!](\bmultiworld\b) (https:\/\/[a-zA-Z0-9_%\/?,.]{4,200})/i);
        let seed = match[2];

        context.activeRace.multiworld = true;
        context.activeRace.seedRoller = "Multiworld";
        context.activeRace.seedLink = seed;
        context.activeRace.seedCode = "N/A";

        this._app.db.setRaceData(context.guildId, context.activeRace);

        this._app.routines['updateRaceMessage'](this._app, context);
    }
}