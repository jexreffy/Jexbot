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
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (!context.activeRace.started) {
            result = "Current race has not started";
        } else {
            let match = context.message.match(/^[.!](\bcomment\b) ([ a-zA-Z0-9,./<>?;':"{}|`~!@#$%^&*()=_+]{0,1000})/i);

            if (match && match.length > 2) {
                let player = context.activeRace.players.find(x => x.discordId === context.userId);

                if (player) {
                    if (!(player.finished || player.forfeited)) {
                        result = "Racer is actively racing";
                    }
                } else {
                    result = "Not a valid racer";
                }
            } else {
                result = "Command is not formatted correctly";
            }
        }

        return result;
    }

    executeCommand(context) {
        let player = context.activeRace.players.find(x => x.discordId === context.userId);
        let match = context.message.match(/^[.!](\bcomment\b) ([ a-zA-Z0-9,./<>?;':"{}|`~!@#$%^&*()=_+]{0,1000})/i);

        player.comment = match[2];

        this._app.sendToDiscordRaceChannel(context.guildId, `**${context.displayName} commented ||${player.comment}||**`).then().catch(console.error);

        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}