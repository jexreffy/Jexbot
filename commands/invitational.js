const updateRaceMessage = require('../common/updateRaceMessage');
const resetRace = require('../common/resetRace');
const join = require('./join');

module.exports = (config, db, race, dChannel, message) => {
    if (race.finished || (message.member && message.member.hasPermission('KICK_MEMBERS', false, false)) || config.referees.includes(message.author.username)) {
        let match = message.content.match(/^[.!](\binvitational\b) ([a-zA-Z0-9<>:]{4,20}) ([a-zA-Z0-9<>:]{4,30}) ([a-zA-Z0-9<>:]{4,30})/i);

        let category = config.defaultCategory;
        let categories = Object.keys(config.categories);

        for (let i = 0; i < categories.length; i++) {
            if (match[2] === categories[i]) {
                category = categories[i];
                break;
            }
        }

        resetRace(race);

        race.invitational = true;
        race.category = category;
        race.categoryName = config.categories[category].name;
        race.mutlistream = 'https://multistre.am/';
        race.status = 'PRE-RACE: WAITING FOR PLAYERS';

        let embed = {
            'content': "",
            'embed': {
                'color': 65280,
                'title': 'Crystal Company Race'
            }
        };

        const guildId = dChannel.guild.id;
        db.setActiveRace(guildId);

        let playerOne = dChannel.client.users.cache.filter(user => user.username === match[3]).array()[0];
        let playerTwo = dChannel.client.users.cache.filter(user => user.username === match[3]).array()[1];

        dChannel.send(`<@${playerOne.id}> <@${playerTwo.id}> ${config.invitationalPing}`);
        dChannel.send(embed).then(x => {
            race.messageId = x.id;
            join(config, db, race, dChannel, match[3], message);
            join(config, db, race, dChannel, match[4], message);
        }).catch((error) => {
            console.log(error);
        });
    }
};