'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandFriday extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'friday';
    }

    get isRaceCommand() {
        return false;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (context.message.match(/(\byou know what that means\b)/i) === null) {
            result = "Command is not valid";
        }

        return result;
    }

    executeCommand(context) {
        let hasScotch = context.message.match(/(\bscotch\b)/i) !== null;
        let hasBeer = context.message.match(/(\bbeer\b)/i) !== null;

        let randomIndex = 0;

        if (hasScotch) {
            randomIndex = 6;
        } else if (hasBeer) {
            randomIndex = 0;
        } else {
            randomIndex = this._app.routines['getRandom'](this._app.config['friday'].length);
        }

        context.messageChannel.send(
            this._app.config['friday'][randomIndex].replace('NAME', context.displayName)
        ).then().catch(console.error);;
    }
}