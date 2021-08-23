'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandLeaderboard extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'leaderboard';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               context.activeRace.finished;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bleaderboard\b) ((alttpr)|(ff4fe)) ([a-zA-Z0-9<>:]{4,20})/i);
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

        let board = this._app.db.getCategoryLeaderboard(categoryName);

        if (board) {
            let output = `Leaderboard as of ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`;
            output +='\n   `' + this._app.routines['centerPad'](('Category: ' + categoryTitle), 34) + '`';

            let outputSize = (board.length > this._app.config['defaultLeaderboardSize']) ? this._app.config['defaultLeaderboardSize'] : board.length;

            for (let i = 0; i < outputSize; i++) {
                output += '\n   `' + ((i + 1).toString().padStart(2, " ") + '. ' + board[i].username.replace(/\W/gi, "")).padEnd(24, " ");
                output += (board[i].elo + ' ').padEnd(10, " ") + '`';
            }
            this._app.sendToDiscordRaceChannel(context.guildId, output).then().catch(console.error);
        }
    }
}