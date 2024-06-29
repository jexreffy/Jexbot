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
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (context.activeRace.started) {
            result = "Race is currently in progress";
        } else if (context.activeRace.players.find(x => x.discordId === context.userId) === undefined) {
            result = "User is not in the race";
        }

        return result;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\btwitchbot\b) ((\bon\b)|(\boff\b))/i);

        if (!match || match.length <= 2) return;

        let isStreaming = match[2] === 'on';

        this._app.db.setPlayerTwitchBot(context.userId, isStreaming);
        this._app.routines['updateRaceMessage'](this._app, context);
    }
}