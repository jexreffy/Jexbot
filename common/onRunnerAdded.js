'use strict'
module.exports = (app, context, player) => {
    let username = player.username;
    context.activeRace.players.push(player);
    context.activeRace.remainingPlayers += 1;

    let role = app.getRacerRole(context.guildId);
    let member = app.findDiscordMember(context.guildId, username);
    member.roles.add(role.id).then().catch(console.error);

    if (app.db.getPlayerStreaming(username)) {
        let userTwitch = app.db.getPlayerTwitch(username);
        if (userTwitch) {
            context.activeRace.multistream += userTwitch + '/';
            player.twitch = `#${userTwitch}`;
        } else {
            context.activeRace.multistream += username.replace(/\W/gi, "") + '/'
            player.twitch = `#${username}`;
        }
    }
}