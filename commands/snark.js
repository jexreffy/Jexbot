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
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        } else if (this._app.config['botOwnerName'] !== context.username) {
            result = "Only Jexreffy can speak for JexBot";
        }

        return result;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bsnark) ([a-zA-Z0-9\-]{2,100}) ([\s\S]*)/i);

        let channel = this._app.findDiscordChannelByName(context.guildId, match[2]);

        channel.send(match[3]).then().catch(console.error);
    }
}