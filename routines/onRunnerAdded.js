'use strict'
module.exports = (app, context, player) => {
    let userId = player.discordId;

    let role = app.getRacerRole(context.guildId);
    let member = app.findDiscordMemberById(context.guildId, userId);
    member.roles.add(role.id).then().catch(console.error);

    context.activeRace.players.push(player);
    context.activeRace.remainingPlayers += 1;
}