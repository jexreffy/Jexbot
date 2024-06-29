'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandBlueBalls extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'blueballs';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.TWITCH) {
            result = "Twitch must be origination of command";
        } else if (!context.activeRace.started) {
            result = "Race has not started";
        } else if (context.activeRace.finished) {
            result = "Race has finished";
        } else if (context.activeRace.blueballs >= 0) {
            result = "Blueballs has been set";
        }

        return result;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bblueballs\b) ([0-9]{1,2})/i);

        if (!match || match.length <= 2) return;

        let blueballs = parseInt(match[2]);

        if (blueballs < 0 || blueballs > 15) return;

        context.activeRace.blueballs = blueballs;

        this._app.sendToTwitchChannel(context.guildId, context.messageChannel, `Aga 1 Blue Balls recorded as ${blueballs}`).then().catch(console.error);

        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}