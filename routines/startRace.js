'use strict'
module.exports = (app, context) => {
    const sleep = app.sleep;
    (async() => {
        let countdown = app.config['countdowns'][context.activeRace.countdownIndex];

        switch (countdown) {
            case 1:
            case 3:
            case 4:
            case 5:
            case 8:
                app.db.setSpaceballs(Date.now());
                break;
            default:
                break;
        }

        let jokeTime = app.routines['getRandom'](app.config['jokeCountdownMax']);
        let jokeUnits = app.config['jokeUnits'][app.routines['getRandom'](app.config['jokeUnits'].length)];
        app.sendToDiscordRaceChannel(context.guildId, `**The race will start in ${jokeTime} ${jokeUnits}**`).then().catch(console.error);
        await sleep(100);

        context.activeRace.status = countdown.firstLine;
        app.sendToDiscordRaceChannel(context.guildId, `**${context.activeRace.status}**`).then().catch(console.error);
        app.routines['updateRaceMessage'](app, context);
        await sleep(countdown.firstDelay);

        context.activeRace.status = countdown.secondLine;
        app.sendToDiscordRaceChannel(context.guildId, `**${context.activeRace.status}**`).then().catch(console.error);
        app.routines['updateRaceMessage'](app, context);
        await sleep(countdown.secondDelay);

        for (let i = countdown.countdown; i > 0; i--) {
            context.activeRace.status = 'Starting in: ' + i;
            app.routines['updateRaceMessage'](app, context);
            let allReady = context.activeRace.players.every(x => x.ready === true);
            if (!(context.activeRace.gatekeeper || allReady)) {
                context.activeRace.status = 'INTERRUPTED: WAITING FOR PLAYERS';
                app.routines['updateRaceMessage'](app, context);
                return;
            }

            if (i <= 5) app.sendToDiscordRaceChannel(context.guildId, `**${i}**`).then().catch(console.error);
            await sleep(1000);
        }

        app.sendToDiscordRaceChannel(context.guildId, `**GO!!!**`).then().catch(console.error);
        await sleep(100);

        context.activeRace.status = 'GO!!!';
        context.activeRace.started = true;
        context.activeRace.startedAt = Date.now();

        if (context.activeRace.teams && context.activeRace.relay) {
            let teamCount = 0;
            for (let i = 0; i < context.activeRace.players.length; i++) {
                if (teamCount < context.activeRace.players[i].team + 1) {
                    teamCount = context.activeRace.players[i].team + 1;
                }
            }

            for (let i = 0; i < teamCount; i++) {
                context.activeRace.legStartTime.push(0);
            }
        }

        app.routines['updateRaceMessage'](app, context);
        await sleep(1900);

        context.activeRace.status = 'RACE STARTED';
        app.routines['updateRaceMessage'](app, context);
    })();
};