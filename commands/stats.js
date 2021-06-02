module.exports = (config, db, race, channel, message) => {
    const centerPad = (str, length, char = ' ') => str.padStart((str.length + length) / 2, char).padEnd(length, char);
    let match = message.content.match(/^[.!](\bstats\b) ([a-zA-Z 0-9%]{0,30})/i);
    let categoryName = match && match.length > 2 ? match[2] : null;
    let categoryTitle = categoryName;
    let stats = null;
    let player = false;

    let categories = db.getCategories();

    if (categoryName) {
        for (let i = 0; i < categories.length; i++) {
            if (match[2] === categories[i]) {
                categoryName = categories[i];
                categoryTitle = db.getCategory(categoryName).name;
                break;
            }
        }

        stats = db.getCategoryStats(categoryName);
        if (!stats) {
            stats = db.getPlayerStats(message.author.username);
            player = true;
        }
    } else {
        stats = db.getPlayerStats(message.author.username);
        player = true;
    }

    let output = '';
    if (stats && player) {
        output += message.author.username + ' stats';
        output += '\n Stream: <' + stats.twitch + '>';
        stats.categories.forEach(element => {
            let title = element.name;

            for (let i = 0; i < categories.length; i++) {
                if (title === categories[i]) {
                    title = db.getCategory(title).name;
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
        output += '\n`' + centerPad((categoryTitle), 24) + '`';
        output += '\n`' + (' Players: ' + stats.categoryPlayers).padEnd(24, " ") + '`';
        output += '\n`' + (' Matches: ' + stats.totalRuns).padEnd(24, " ") + '`';
        output += '\n`' + centerPad(('Top 3'), 24) + '`';
        output += '\n`' + ('1.' + stats.top[0].username).padEnd(19, " ") + (stats.top[0].elo + ' ').padEnd(5, " ") + '`';
        output += '\n`' + ('2.' + stats.top[1].username).padEnd(19, " ") + (stats.top[1].elo + ' ').padEnd(5, " ") + '`';
        output += '\n`' + ('3.' + stats.top[2].username).padEnd(19, " ") + (stats.top[2].elo + ' ').padEnd(5, " ") + '`';
    }

    if (stats) {
        channel.send(output).then().catch(console.error);
    }
};