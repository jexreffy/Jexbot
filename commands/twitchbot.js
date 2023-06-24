'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandTwitchBot extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'twitchbot';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               !context.activeRace.started &&
               context.activeRace.players.find(x => x.discordId === context.userId) !== undefined;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\btwitchbot\b) ((\bon\b)|(\boff\b))/i);

        if (!match || match.length <= 2) return;

        let isStreaming = match[2] === 'on';

        this._app.db.setPlayerTwitchBot(context.userId, isStreaming);
        this._app.routines['updateRaceMessage'](this._app, context);
    }
}