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
        return context.origination === this._app.DISCORD &&
               !context.activeRace.started &&
               context.activeRace.players.find(x => x.discordId === context.userId) !== undefined;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\btwitch\b) ([a-zA-Z0-9_]{4,30})/i);

        if (!match || match.length <= 2) return;

        let twitch = match[2];

        this._app.db.setPlayerTwitch(context.userId, twitch);

        let userTwitch = this._app.db.getPlayerTwitch(context.userId);

        let player = context.activeRace.players.find(x => x.discordId === context.userId);
        player.twitch = `#${userTwitch}`;

        context.activeRace.multistream = context.activeRace.multistream.replace(new RegExp(userTwitch + '/', 'i'), "");
        if (this._app.db.getPlayerStreaming(context.userId)) context.activeRace.multistream += twitch + '/';

        this._app.db.setRaceData(context.guildId, context.activeRace);
        this._app.routines['updateRaceMessage'](this._app, context);
    }
}