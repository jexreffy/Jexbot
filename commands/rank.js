module.exports = (config, db, channel, message, username) => {
    const centerPad = (str, length, char = ' ') => str.padStart((str.length + length) / 2, char).padEnd(length, char);
    let match = message.content.match(/^[.!](\brank\b) ([a-zA-Z0-9%]{0,20})/i);
    let categoryName = config.defaultCategory;
    let categoryTitle = categoryName;

    if (match && match.length > 2) {
        let categories = Object.keys(config.categories);

        for (let i = 0; i < categories.length; i++) {
            if (match[2] === categories[i]) {
                categoryName = categories[i];
                categoryTitle = config.categories[categoryName].name;
                break;
            }
        }
    }

    let board = db.getCategoryLeaderboard(categoryName);

    if (board) {
        let playerRank = board.map(function(e) { return e.username; }).indexOf(username);
        let output = '` ' + username + ' rank in ' + categoryTitle + ': ';
        if (playerRank > -1) {
            output += (playerRank + 1) + '`';
        } else {
            output += 'unranked `';
        }

        channel.send(centerPad(output, 24)).then().catch(console.error);
    }
};