const data = require('../data/data.js');

module.exports = (config, race, player, message) => {
    let username = player.username;
    console.log(username);
    race.players.splice(race.players.indexOf(player), 1);
    race.remainingPlayers -= 1;

    /*let role = message.guild.roles.cache.find(r => r.name === config.racerRole);
    let member = message.guild.members.fetch(player.id);
    member.roles.remove(role.id).then().catch(console.error);*/

    let userTwitch = data.getPlayerTwitch(username);
    if (!userTwitch) {
        userTwitch = username;
    }

    race.mutlistream = race.mutlistream.replace(new RegExp(userTwitch + '/', 'i'), "");
}