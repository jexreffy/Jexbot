const getRandom = require('../common/getRandom');
const setRaceCategory = require('../common/setRaceCategory');
const resetRace = require('../common/resetRace');
const join = require('./join');

module.exports = (config, db, race, dChannel, message) => {
    if (race.finished && config.referees.includes(message.author.username)) {
        let match = message.content.match(/^[.!](\binvitational\b) ([a-zA-Z0-9]{4,20}) ([a-zA-Z0-9<>:_]{4,30}) ([a-zA-Z0-9<>:_]{4,30})/i);

        resetRace(race);

        const guildId = dChannel.guild.id;

        race.invitational = true;
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

        //let playerOne = dChannel.client.users.cache.filter(user => user.username === match[3]).array()[0];
        //let playerTwo = dChannel.client.users.cache.filter(user => user.username === match[4]).array()[0];

        //dChannel.send(`<@${match[3]}> <@${match[4]}> ${config.invitationalPing}`);
        dChannel.send(embed).then(x => {
            race.messageId = x.id;
            join(config, db, race, dChannel, match[3], message, true);
            join(config, db, race, dChannel, match[4], message, true);
        }).catch((error) => {
            console.log(error);
        });
    }
};