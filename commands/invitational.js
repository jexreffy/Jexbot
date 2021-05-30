const getRandom = require('../common/getRandom');
const setRaceCategory = require('../common/setRaceCategory');
const resetRace = require('../common/resetRace');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, message) => {
    if (race.finished && config.referees.includes(message.author.username)) {
        let match = message.content.match(/^[.!](\binvitational\b) ([a-zA-Z0-9]{4,20})/i);

        resetRace(race);

        const guildId = dChannel.guild.id;

        race.invitational = true;
        race.locked = true;
        race.countdownIndex = getRandom(config.countdowns.length);
        race.mutlistream = 'https://multistre.am/';
        race.status = 'INVITATIONAL RACE: WAITING FOR PLAYERS TO READY UP';

        if (match && match.length > 2 && match[2] === "relay") {
            race.teams = true;
            race.relay = true;
        } else {
            setRaceCategory(config, db, race, guildId, match && match.length > 2 ? match[2] : "");
        }

        let embed = {
            'content': "",
            'embed': {
                'color': 65280,
                'title': 'Crystal Company Race'
            }
        };

        db.setActiveRace(guildId);

        dChannel.send(embed).then(x => {
            race.messageId = x.id;
            updateRaceMessage(db, race, dChannel);
        }).catch((error) => {
            console.log(error);
        });
    }
};