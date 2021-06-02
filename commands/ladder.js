const setRaceCategory = require('../common/setRaceCategory');
const resetRace = require('../common/resetRace');

module.exports = (config, db, race, dChannel, message) => {
    if (race.finished && config.botOwnerName === message.author.username && config.botOwnerGuild === message.guild.id) {
        let match = message.content.match(/^[.!](\bladder\b) ([a-zA-Z0-9<>:]{4,20})/i);

        const guildId = dChannel.guild.id;

        resetRace(race);

        race.ladder = true;
        race.started = true;
        race.startedAt = race.initiatedAt;

        setRaceCategory(config, db, race, guildId, match && match.length > 2 ? match[2] : "");

        db.setActiveRace(guildId);
    }
};