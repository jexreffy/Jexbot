const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, username, tClient, tChannel) => {
    if (tClient) {
        let message = config.crewMessage + " ";

        for (let i = 0; i < race.crew.length; i++) {
            if (race.crew[i].twitch) {
                message += `https://twitch.tv/${race.crew[i].twitch.substr(1)}${i !== race.crew.length - 1 ? ' ' : ''}`;
            } else {
                message += `https://twitch.tv/${race.crew[i].username}${i !== race.crew.length - 1 ? ' ' : ''}`;
            }
        }

        tClient.say(tChannel, message).then().catch(console.error);
    } else {
        let crew = race.crew.find(x => x.username === username);

        if (!(race.started || race.finished || crew)) {
            let newCrew = {
                username: username
            };

            race.crew.push(newCrew);

            //let role = message.guild.roles.cache.find(r => r.name === config.guilds[message.guild.id].racerRole);
            //message.member.roles.add(role.id).then().catch(console.error);

            let userTwitch = db.getPlayerTwitch(username);
            if (userTwitch) {
                newCrew.twitch = userTwitch;
            } else {
                newCrew.twitch = username;
            }

            updateRaceMessage(db, race, dChannel);
        }
    }
};