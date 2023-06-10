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
        return context.origination === this._app.DISCORD &&
               !context.activeRace.started &&
               context.activeRace.players.find(x => x.discordId === context.userId) !== undefined;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\busername\b) ([a-zA-Z0-9_]{4,30})/i);

        if (!match || match.length <= 2) return;

        let username = match[2];

        if (this._app.db.isUsernameUnique(username)) {
            this._app.db.setPlayerUsername(context.userId, username);

            username = this._app.db.getPlayerUsername(context.userId);

            let player = context.activeRace.players.find(x => x.discordId === context.userId);
            player.username = username;

            this._app.db.setRaceData(context.guildId, context.activeRace);
            this._app.routines['updateRaceMessage'](this._app, context);
        }
    }
}