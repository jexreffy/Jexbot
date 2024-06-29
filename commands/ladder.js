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
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (!context.activeRace.finished) {
            result = "Current Race has not finished";
        } else if (this._app.config['botOwnerName'] !== context.username) {
            result = "Only Jexreffy can speak for JexBot";
        } else if (this._app.config['botOwnerGuild'] !== context.guildId) {
            result = "Only Jexreffy can issue this command from his Discord Server";
        }

        return result;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bladder\b) ([a-zA-Z0-9<>:]{4,20})/i);
        let category =  match && match.length > 2 ? match[2] : "";

        const guildId = context.guildId;

        this._app.routines['resetRace'](context.activeRace);

        context.activeRace.ladder = true;
        context.activeRace.started = true;
        context.activeRace.startedAt = context.activeRace.initiatedAt;

        this._app.routines['setRaceCategory'](this._app, context, 'alttpr', category);

        this._app.db.setRaceData(guildId, context.activeRace);
    }
}