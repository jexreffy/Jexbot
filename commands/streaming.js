'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandStreaming extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'streaming';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bstreaming\b) ((\bon\b)|(\boff\b))/i);
        let isStreaming = match[3] === "on";

        let player = context.activeRace.players.find(x => x.username === context.username);
        this._app.db.setPlayerStreaming(context.username, isStreaming);

        if (player) {
            let userTwitch = this._app.db.getPlayerTwitch(context.username);
            if (!userTwitch) {
                userTwitch = context.username;
            }

            context.activeRace.mutlistream = context.activeRace.mutlistream.replace(new RegExp(userTwitch + '/', 'i'), "");
            if (this._app.db.getPlayerStreaming(context.username)) context.activeRace.mutlistream += userTwitch + '/';

            this._app.db.setRaceData(context.guildId, context.activeRace);
            this._app.routines['updateRaceMessage'](this._app, context);
        }
    }
}