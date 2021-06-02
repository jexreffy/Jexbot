module.exports = (config, db, channel, message) => {
    const centerPad = (str, length, char = ' ') => str.padStart((str.length + length) / 2, char).padEnd(length, char);
    let match = message.content.match(/^[.!](\bleaderboard\b) ([a-zA-Z0-9%]{0,20})/i);
    let categoryName = config.defaultCategory;
    let categoryTitle = categoryName;

    if (match && match.length > 2) {
        let categories = db.getCategories();

        for (let i = 0; i < categories.length; i++) {
            if (match[2] === categories[i]) {
                categoryName = categories[i];
                categoryTitle = db.getCategory(categoryName).name;
                break;
            }
        }
    }

    let board = db.getCategoryLeaderboard(categoryName);

    if (board) {
        let output = `Leaderboard as of ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`;
        output +='\n   `' + centerPad(('Category: ' + categoryTitle), 34) + '`';

        let outputSize = (board.length > parseInt(config.defaultLeaderboardSize)) ? parseInt(config.defaultLeaderboardSize) : board.length;

        for (let i = 0; i < outputSize; i++) {
            output += '\n   `' + ((i + 1).toString().padStart(2, " ") + '. ' + board[i].username.replace(/\W/gi, "")).padEnd(24, " ");
            output += (board[i].elo + ' ').padEnd(10, " ") + '`';
        }
        channel.send(output).then().catch(console.error);
    }
};