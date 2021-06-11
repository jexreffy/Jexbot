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
        return context.origination === this._app.DISCORD;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\btwitchbot\b) ((\bon\b)|(\boff\b))/i);
        let isStreaming = match[3] === 'on';

        let player = context.activeRace.players.find(x => x.username === context.username);
        if (player) {
            this._app.db.setPlayerTwitchBot(context.username, isStreaming);

            this._app.routines['updateRaceMessage'](this._app, context);
        } else {
            this._app.db.setPlayerTwitchBot(context.username, isStreaming);
        }
    }
}