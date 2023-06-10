'use strict'
module.exports = (app, context, player) => {
    let userId = player.discordId;
    let role = app.getRacerRole(context.guildId);
    let member = app.findDiscordMember(context.guildId, userId);
    member.roles.remove(role.id).then().catch(console.error);

    if (context.activeRace.remainingPlayers < 1) {
        context.activeRace.finished = true;
        context.activeRace.spoilersAllowed = true;
        context.activeRace.status = 'RACE FINISHED';

        if (!(context.activeRace.teams || context.activeRace.multiworld)) {
            app.routines['sortPlayers'](context.activeRace.players, false, false);

            let adjustments = app.routines['resolveMatchElo'](app, context.activeRace.players, context.activeRace.category);
            for (let i = 0; i < context.activeRace.players.length; i++) {
                context.activeRace.players[i].adjustment = adjustments[i];
            }
        }

        if (!context.activeRace.gtbkWinner) {
            app.routines['gtbkWinner'](app, context);
        }

        const sleep = app.sleep;
        (async() => {
            await sleep(5000);
            app.routines['updateRaceMessage'](app, context);
            app.routines['broadcastMessage'](app, context, `The race has finished.`, true, true);
        })();
    } else if (!context.activeRace.invitational &&
               context.activeRace.remainingPlayers <= context.activeRace.players.length / 2 && !context.activeRace.spoilersAllowed) {
        context.activeRace.spoilersAllowed = true;

        if (!context.activeRace.gtbkWinner) {
            app.routines['gtbkWinner'](app, context);
        }

        const sleep = app.sleep;
        (async() => {
            await sleep(5000);
            app.routines['updateRaceMessage'](app, context);
            app.routines['broadcastMessage'](app, context, `Spoilers are now allowed for the race.`, true, true);
        })();
    } else {
        app.routines['updateRaceMessage'](app, context);
    }
}