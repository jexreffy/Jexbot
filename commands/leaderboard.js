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
        return context.origination === this._app.DISCORD;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bleaderboard\b) ([a-zA-Z0-9%]{0,20})/i);
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

        let board = this._app.db.getCategoryLeaderboard(categoryName);

        if (board) {
            let output = `Leaderboard as of ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`;
            output +='\n   `' + this._app.routines['centerPad'](('Category: ' + categoryTitle), 34) + '`';

            let outputSize = (board.length > this._app.config['defaultLeaderboardSize']) ? this._app.config['defaultLeaderboardSize'] : board.length;

            for (let i = 0; i < outputSize; i++) {
                output += '\n   `' + ((i + 1).toString().padStart(2, " ") + '. ' + board[i].username.replace(/\W/gi, "")).padEnd(24, " ");
                output += (board[i].elo + ' ').padEnd(10, " ") + '`';
            }
            this._app.sendToDiscordRaceChannel(output).then().catch(console.error);
        }
    }
}