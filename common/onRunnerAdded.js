const data = require('../data/data.js');

module.exports = (config, race, player, message) => {
    let username = player.username;
    race.players.push(player);
    race.remainingPlayers += 1;

    let role = message.guild.roles.cache.find(r => r.name === config.racerRole);
    message.member.roles.add(role.id).then().catch(console.error);

    if (data.getPlayerStreaming(username)) {
        let userTwitch = data.getPlayerTwitch(username);
        if (userTwitch) {
            race.mutlistream += userTwitch + '/';
        } else {
            race.mutlistream += username.replace(/\W/gi, "") + '/';
        }
    }
}