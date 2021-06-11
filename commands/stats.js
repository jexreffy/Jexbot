'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandStats extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'stats';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD;
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bstats\b) ([a-zA-Z0-9%]{0,20})/i);
        let categoryName = this._app.config['defaultCategory'];
        let categoryTitle = categoryName;
        let stats = null;
        let player = false;

        let categories = this._app.db.getCategories();

        if (match && match.length > 2) {
            for (let i = 0; i < categories.length; i++) {
                if (match[2] === categories[i]) {
                    categoryName = categories[i];
                    categoryTitle = this._app.db.getCategory(categoryName).name;
                    break;
                }
            }

            stats = this._app.db.getCategoryStats(categoryName);
            if (!stats) {
                stats = this._app.db.getPlayerStats(context.username);
                player = true;
            }
        } else {
            stats = this._app.db.getPlayerStats(context.username);
            player = true;
        }

        let output = '';
        if (stats && player) {
            output += context.username + ' stats';
            output += '\n Stream: <' + stats.twitch + '>';
            stats.categories.forEach(element => {
                let title = element.name;

                for (let i = 0; i < categories.length; i++) {
                    if (title === categories[i]) {
                        title = this._app.db.getCategory(title).name;
                        break;
                    }
                }

                output += '\n' + ('`Category: ' + title).padEnd(35, " ") + '`';
                output += '\n' + ('`  Rank: ' + element.rank).padEnd(35, " ") + '`';
                output += '\n' + ('`  Elo: ' + element.elo).padEnd(35, " ") + '`';
                output += '\n' + ('`  Matches: ' + element.matches).padEnd(35, " ") + '`';
            });
        } else if (stats) {
            output += 'Stats:';
            output += '\n`' + this._app.routines['centerPad']((categoryTitle), 24) + '`';
            output += '\n`' + (' Players: ' + stats.categoryPlayers).padEnd(24, " ") + '`';
            output += '\n`' + (' Matches: ' + stats.totalRuns).padEnd(24, " ") + '`';
            output += '\n`' + this._app.routines['centerPad'](('Top 3'), 24) + '`';
            output += '\n`' + ('1.' + stats.top[0].username).padEnd(19, " ") + (stats.top[0].elo + ' ').padEnd(5, " ") + '`';
            output += '\n`' + ('2.' + stats.top[1].username).padEnd(19, " ") + (stats.top[1].elo + ' ').padEnd(5, " ") + '`';
            output += '\n`' + ('3.' + stats.top[2].username).padEnd(19, " ") + (stats.top[2].elo + ' ').padEnd(5, " ") + '`';
        }

        if (stats) {
            context.raceChannel.send(output).then().catch(console.error);
        }
    }
}