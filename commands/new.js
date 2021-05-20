const getRandom = require('../common/getRandom');
const setRaceCategory = require('../common/setRaceCategory');
const updateRaceMessage = require('../common/updateRaceMessage');
const resetRace = require('../common/resetRace');

module.exports = (config, db, race, dChannel, message) => {
    if (race.finished && config.referees.includes(message.author.username)) {
        let match = message.content.match(/^[.!](\bnew\b) ([a-zA-Z0-9<>:]{4,20})/i);

        const guildId = dChannel.guild.id;

        resetRace(race);

        race.pingIndex = getRandom(config.pings.length);
        race.countdownIndex = getRandom(config.countdowns.length);
        race.mutlistream = 'https://multistre.am/';
        race.status = 'PRE-RACE: WAITING FOR PLAYERS';

        setRaceCategory(config, db, race, guildId, match && match.length > 2 ? match[2] : "");

        let embed = {
            'content': "",
            'embed': {
                'color': 65280,
                'title': 'Crystal Company Race'
            }
        };

        db.setActiveRace(guildId);
        let role = message.guild.roles.cache.find(r => r.name === config.guilds[guildId].pingRole);

        dChannel.send(`${role} ${config.pings[race.pingIndex]}`);
        dChannel.send(embed).then(x => {
            race.messageId = x.id;
            updateRaceMessage(db, race, dChannel);
        }).catch((error) => {
            console.log(error);
        });
    }
};