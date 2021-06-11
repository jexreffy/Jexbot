'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandHelp extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'help';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.TWITCH;
    }

    executeCommand(context) {
        let message = context.activeRace.ladder ? 'helpLadder' : (context.activeRace.invitational ? 'helpInvitational' : 'helpRace');
        context.twitchClient.say(context.messageChannel, this._app.config[message]).then().catch(console.error);
    }
}