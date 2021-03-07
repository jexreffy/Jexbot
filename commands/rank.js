const config = require('../config.json');
const data = require('../data/data.js');

module.exports = (channel, message, username) => {
    const centerPad = (str, length, char = ' ') => str.padStart((str.length + length) / 2, char).padEnd(length, char);
    let match = message.content.match(/^[.!](\brank\b) ([ a-zA-Z0-9%]{0,20})/i);
    let category = match[2];

    let board = data.getCategoryLeaderboard(category);

    if (board) {
        let playerRank = board.map(function(e) { return e.username; }).indexOf(username);
        let output = '` ' + username + ' rank in ' + category + ': ';
        if (playerRank > -1) {
            output += (playerRank + 1) + '`';
        } else {
            output += 'unranked `';
        }

        channel.send(centerPad(output, 24)).then().catch(console.error);
    }
};