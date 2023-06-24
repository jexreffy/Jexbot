'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandComment extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'comment';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let player = context.activeRace.players.find(x => x.discordId === context.userId);
        let match = context.message.match(/^[.!](\bcomment\b) ([ a-zA-Z0-9,./<>?;':"{}|`~!@#$%^&*()=_+]{0,1000})/i);

        return context.origination === this._app.DISCORD &&
               match && match.length > 2 &&
               context.activeRace.started &&
               player && (player.finished || player.forfeited);
    }

    executeCommand(context) {
        let player = context.activeRace.players.find(x => x.discordId === context.userId);
        let match = context.message.match(/^[.!](\bcomment\b) ([ a-zA-Z0-9,./<>?;':"{}|`~!@#$%^&*()=_+]{0,1000})/i);

        player.comment = match[2];

        this._app.sendToDiscordRaceChannel(context.guildId, `**${context.displayName} commented ||${player.comment}||**`).then().catch(console.error);

        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}