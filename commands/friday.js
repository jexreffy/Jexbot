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
        return context.origination === this._app.DISCORD &&
               context.message.match(/(\byou know what that means\b)/i) !== null;
    }

    executeCommand(context) {
        let randomIndex = this._app.routines['getRandom'](this._app.config['friday'].length);
        context.messageChannel.send(
            this._app.config['friday'][randomIndex].replace('NAME', context.username)
        ).then().catch(console.error);;
    }
}