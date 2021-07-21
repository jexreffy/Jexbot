'use strict'
module.exports = (app, context, player) => {
    let username = player.username;
    context.activeRace.players.splice(context.activeRace.players.indexOf(player), 1);
    context.activeRace.remainingPlayers -= 1;

    let role = app.getRacerRole(context.guildId);
    let member = app.findDiscordMember(context.guildId, username);
    member.roles.remove(role.id).then().catch(console.error);

    let userTwitch = app.db.getPlayerTwitch(username);
    if (!userTwitch) {
        userTwitch = username;
    }

    context.activeRace.multistream = context.activeRace.multistream.replace(new RegExp(userTwitch + '/', 'i'), "");
}