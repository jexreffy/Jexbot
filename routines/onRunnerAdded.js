'use strict'
module.exports = (app, context, player) => {
    let userId = player.discordId;
    let username = player.username;

    let role = app.getRacerRole(context.guildId);
    let member = app.findDiscordMember(context.guildId, userId);
    member.roles.add(role.id).then().catch(console.error);

    if (app.db.getPlayerStreaming(userId)) {
        let userTwitch = app.db.getPlayerTwitch(userId);
        let shouldConnect = app.db.getPlayerTwitchBot(userId);

        if (userTwitch) {
            context.activeRace.multistream += userTwitch + '/';
            player.twitch = `#${userTwitch}`;
            player.twitchBot = shouldConnect ?? false;
        } else {
            context.activeRace.multistream += username.replace(/\W/gi, "") + '/'
            player.twitch = `#${username}`;
            player.twitchBot = shouldConnect ?? false;
        }
    }

    context.activeRace.players.push(player);
    context.activeRace.remainingPlayers += 1;
}