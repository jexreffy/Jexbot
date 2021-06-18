'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandLadder extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'ladder';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               context.activeRace.finished &&
               this._app.config['botOwnerName'] === context.username &&
               this._app.config['botOwnerGuild'] === context.guildId;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bladder\b) ([a-zA-Z0-9<>:]{4,20})/i);

        const guildId = context.guildId;

        this._app.routines['resetRace'](context.activeRace);

        context.activeRace.ladder = true;
        context.activeRace.started = true;
        context.activeRace.startedAt = race.initiatedAt;

        this._app.routines['setRaceCategory'](this._app, context, match && match.length > 2 ? match[2] : "");

        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}