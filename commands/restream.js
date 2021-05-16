const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, message) => {
    if (!race.started && config.referees.includes(message.author.username)) {
        let match = message.content.match(/^[.!](\brestream\b) ((\bon\b)|(\boff\b))/i);
        let isRestream = match[3] === "on";

        race.restream = isRestream ? config.guilds[message.guild.id].restreamChannel : null;

        updateRaceMessage(db, race, dChannel);
    }
}