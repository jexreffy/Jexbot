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
        return context.origination === this._app.DISCORD &&
               !context.activeRace.seedLink &&
               !context.activeRace.started &&
               (this._app.config['referees'].includes(context.username) ||
                   context.activeRace.players.find(x => x.discordId === context.userId));
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