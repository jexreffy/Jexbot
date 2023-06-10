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
        return context.origination === this._app.DISCORD &&
               !context.activeRace.started &&
               context.activeRace.players.find(x => x.discordId === context.userId) !== undefined;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bstreaming\b) ((\bon\b)|(\boff\b))/i);

        if (!match || match.length <= 2) return;

        let isStreaming = match[3] === "on";

        this._app.db.setPlayerStreaming(context.userId, isStreaming);

        let userTwitch = this._app.db.getPlayerTwitch(context.userId);
        if (!userTwitch) {
            userTwitch = context.username;
        }

        context.activeRace.multistream = context.activeRace.multistream.replace(new RegExp(userTwitch + '/', 'i'), "");
        if (this._app.db.getPlayerStreaming(context.userId)) context.activeRace.multistream += userTwitch + '/';

        this._app.db.setRaceData(context.guildId, context.activeRace);
        this._app.routines['updateRaceMessage'](this._app, context);
    }
}