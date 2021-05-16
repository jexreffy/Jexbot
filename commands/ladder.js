const resetRace = require('../common/resetRace');

module.exports = (config, db, race, dChannel, message) => {
    if (race.finished && config.botOwnerName === message.author.username && config.botOwnerGuild === message.guild.id) {
        let match = message.content.match(/^[.!](\bladder\b) ([a-zA-Z0-9<>:]{4,20})/i);

        let category = config.defaultCategory;

        if (match.length > 2) {
            let categories = Object.keys(config.categories);

            for (let i = 0; i < categories.length; i++) {
                if (match[2] === categories[i]) {
                    category = categories[i];
                    break;
                }
            }
        }

        resetRace(race);

        race.ladder = true;
        race.started = true;
        race.startedAt = race.initiatedAt;
        race.category = category;
        race.categoryName = config.categories[category].name;

        const guildId = dChannel.guild.id;
        db.setActiveRace(guildId);
    }
};