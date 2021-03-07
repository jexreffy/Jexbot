const config = require('../config.json');
const data = require('../data/data.js');

const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (channel, message) => {
    const centerPad = (str, length, char = ' ') => str.padStart((str.length + length) / 2, char).padEnd(length, char);
    let match = message.content.match(/^[.!](\bleaderboard\b) ([ a-zA-Z0-9%]{0,20})/i);
    let category = match[2];

    let board = data.getCategoryLeaderboard(category);

    if (board) {
        let output = 'Leaderboard';
        output += '\n   `' + centerPad(('Category: ' + category), 34) + '`';

        let outputSize = (board.length > parseInt(config.defaultLeaderboardSize)) ? parseInt(config.defaultLeaderboardSize) : board.length;

        for (let i = 0; i < outputSize; i++) {
            output += '\n   `' + ((i + 1).toString().padStart(2, " ") + '. ' + board[i].username.replace(/\W/gi, "")).padEnd(24, " ");
            output += (board[i].elo + ' ').padEnd(10, " ") + '`';
        }
        channel.send(output).then().catch(console.error);
    }
};