'use strict'
module.exports = (app, context, player) => {
    let role = app.getRacerRole(context.guildId);
    let member = app.findDiscordMember(context.guildId, player.username);
    member.roles.remove(role.id).then().catch(console.error);

    if (context.activeRace.remainingPlayers < 1) {
        if (!(context.activeRace.teams || context.activeRace.multiworld)) {
            app.routines['sortPlayers'](context.activeRace.players, false, false);

            let adjustments = app.routines['resolveMatchElo'](app, context.activeRace.players, context.activeRace.category);
            for (let i = 0; i < context.activeRace.players.length; i++) {
                context.activeRace.players[i].adjustment = adjustments[i];
            }
        }

        const sleep = app.sleep;
        (async() => {
            if (!context.activeRace.gtbkWinner) {
                await sleep(5000);
                app.routines['gtbkWinner'](this._app, context);
            }

            await sleep(5000);
            context.activeRace.finished = true;
            context.activeRace.status = 'RACE FINISHED';
            app.routines['updateRaceMessage'](this._app, context);
            app.routines['broadcastMessage'](this._app, context, `The race has finished.`, true);
        })();
    } else if (!context.activeRace.invitational &&
               context.activeRace.remainingPlayers <= context.activeRace.players.length / 2 && !context.activeRace.spoilersAllowed) {
               context.activeRace.spoilersAllowed = true;

        const sleep = app.sleep;
        (async() => {
            await sleep(5000);
            app.routines['broadcastMessage'](this._app, context, `Spoilers are now allowed for the race.`, true);
            await sleep(5000);
            app.routines['gtbkWinner'](this._app, context);
            app.routines['updateRaceMessage'](this._app, context);
        })();
    } else {
        app.routines['updateRaceMessage'](this._app, context);
    }
}