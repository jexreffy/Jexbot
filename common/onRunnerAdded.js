module.exports = (config, db, race, player, message) => {
    let username = player.username;
    race.players.push(player);
    race.remainingPlayers += 1;

    let role = message.guild.roles.cache.find(r => r.name === config.guilds[message.guild.id].racerRole);
    message.member.roles.add(role.id).then().catch(console.error);

    if (!db.getPlayerDiscordId(username)) {
        db.setPlayerDiscordId(username, message.author.id);
    }

    if (db.getPlayerStreaming(username)) {
        let userTwitch = db.getPlayerTwitch(username);
        if (userTwitch) {
            race.mutlistream += userTwitch + '/';
            player.twitch = `#${userTwitch}`;
        } else {
            race.mutlistream += username.replace(/\W/gi, "") + '/'
            player.twitch = `#${username}`;
        }
    }
}