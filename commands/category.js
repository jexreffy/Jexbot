'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandCategory extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'category';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.TWITCH) {
            result = "Twitch must be origination of command";
        }

        return result;
    }

    executeCommand(context) {
        this._app.sendToTwitchChannel(context.guildId, context.messageChannel, `${context.activeRace.categoryName}: ${context.activeRace.categoryDescription}`).then().catch(console.error);
    }
}