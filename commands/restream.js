const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, race, dChannel, message) => {
    if (race.finished || (message.member && message.member.hasPermission('KICK_MEMBERS', false, false)) || config.referees.includes(message.author.username)) {
        let match = message.content.match(/^[.!](\brestream\b) ((\bon\b)|(\boff\b))/i);
        let isRestream = match[3] === "on";

        race.restream = isRestream ? config.guilds[message.guild.id].restreamChannel : null;

        updateRaceMessage(race, dChannel);
    }
}