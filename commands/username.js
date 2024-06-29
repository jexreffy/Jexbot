'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandUsername extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'username';
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
        let match = context.message.match(/^[.!](\busername\b) ([a-zA-Z0-9_]{4,30})/i);

        if (!match || match.length <= 2) return;

        let username = match[2];

        if (this._app.db.isUsernameUnique(username)) {
            this._app.db.setPlayerUsername(context.userId, username);
            this._app.routines['updateRaceMessage'](this._app, context);
        }
    }
}