'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandPB extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'pb';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               context.activeRace.finished;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bpb\b) ([a-zA-Z0-9%]{0,20})/i);
        let categoryName = this._app.config['defaultCategory'];
        let categoryTitle = categoryName;

        if (match && match.length > 2) {
            let categories = this._app.db.getCategories();

            for (let i = 0; i < categories.length; i++) {
                if (match[2] === categories[i]) {
                    categoryName = categories[i];
                    categoryTitle = this._app.db.getCategory(categoryName).name;
                    break;
                }
            }
        }

        let output = `\` ${context.username} PB ${categoryTitle}: ${this._app.routines['getRaceTime'](this._app.db.getPlayerPB(context.username, categoryName))}\``;

        this._app.sendToDiscordRaceChannel(context.guildId, this._app.routines['centerPad'](output, 24)).then().catch(console.error);
    }
}