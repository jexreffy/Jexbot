'use strict'
module.exports = (app, context, player) => {
    let userId = player.discordId;

    context.activeRace.players.splice(context.activeRace.players.indexOf(player), 1);
    context.activeRace.remainingPlayers -= 1;

    let role = app.getRacerRole(context.guildId);
    let member = app.findDiscordMemberById(context.guildId, userId);
    member.roles.remove(role.id).then().catch(console.error);
}