const getRaceTime = require('../common/getRaceTime');

module.exports = (config, db, channel, message, username) => {
    const centerPad = (str, length, char = ' ') => str.padStart((str.length + length) / 2, char).padEnd(length, char);
    let match = message.content.match(/^[.!](\bpb\b) ([a-zA-Z0-9%]{0,20})/i);
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

    let output = `\` ${username} PB ${categoryTitle}: ${getRaceTime(db.getPlayerPB(username, categoryName))}\``;

    channel.send(centerPad(output, 24)).then().catch(console.error);
};