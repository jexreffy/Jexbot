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
        return context.origination === this._app.TWITCH;
    }

    executeCommand(context) {
        context.twitchClient.say(context.messageChannel, `${context.activeRace.categoryName}: ${context.activeRace.categoryDescription}`).then().catch(console.error);
    }
}