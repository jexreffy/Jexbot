'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandTwitch extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'twitch';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\btwitch\b) ([a-zA-Z0-9_]{4,30})/i);

        if (!match || match.length <= 2) return;

        let stream = match[2];

        let player = context.activeRace.players.find(x => x.username === context.username);
        this._app.db.setPlayerTwitch(context.username, stream);

        if (player) {
            let userTwitch = this._app.db.getPlayerTwitch(context.username);
            if (!userTwitch) {
                userTwitch = context.username;
            }

            player.twitch = `#${context.username}`;

            context.activeRace.mutlistream = context.activeRace.mutlistream.replace(new RegExp(userTwitch + '/', 'i'), "");
            if (this._app.db.getPlayerStreaming(context.username)) context.activeRace.mutlistream += stream + '/';

            this._app.db.setRaceData(context.guildId, context.activeRace);
            this._app.routines['updateRaceMessage'](this._app, context);
        }
    }
}