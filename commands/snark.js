'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandSnark extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'snark';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               this._app.config['botOwnerName'] === context.username;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bsnark) ([a-zA-Z0-9\-]{2,100}) ([\s\S]*)/i);

        let channel = this._app.findDiscordChannel(context.guildId, match[2]);

        channel.send(match[3]).then().catch(console.error);
    }
}