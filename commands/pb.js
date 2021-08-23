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
        let match = context.message.match(/^[.!](\bpb\b) ((alttpr)|(ff4fe)) ([a-zA-Z0-9<>:]{4,20})/i);
        let game = match && match.length > 2 ? match[2] : 'alttpr';
        let category = match && match.length > 5 ? match[5] : '';
        let categoryName = this._app.config['defaultCategory'];
        let categoryTitle = categoryName;

        let categories = this._app.db.getCategories(game);

        for (let i = 0; i < categories.length; i++) {
            if (category === categories[i]) {
                categoryName = categories[i];
                categoryTitle = this._app.db.getCategory(game, categoryName).name;
                break;
            }
        }

        let output = `\` ${context.username} PB ${categoryTitle}: ${this._app.routines['getRaceTime'](this._app.db.getPlayerPB(context.username, categoryName))}\``;

        this._app.sendToDiscordRaceChannel(context.guildId, this._app.routines['centerPad'](output, 24)).then().catch(console.error);
    }
}