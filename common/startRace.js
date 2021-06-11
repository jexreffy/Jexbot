'use strict'
module.exports = (app, context) => {
    const sleep = app.sleep;
    (async() => {
        let countdown = app.config['countdowns'][race.countdownIndex];
        let jokeTime = app.routines['getRandom'](app.config['jokeCountdownMax']);
        let jokeUnits = app.config['jokeUnits'][app.routines['getRandom'](app.config['jokeUnits'].length)];
        context.raceChannel.send(`**The race will start in ${jokeTime} ${jokeUnits}**`).then().catch(console.error);
        await sleep(100);

        context.activeRace.status = countdown.firstLine;
        context.raceChannel.send(`**${context.activeRace.status}**`).then().catch(console.error);
        app.routines['updateRaceMessage'](this._app, context);
        await sleep(countdown.firstDelay);

        context.activeRace.status = countdown.secondLine;
        context.raceChannel.send(`**${race.status}**`).then().catch(console.error);
        app.routines['updateRaceMessage'](this._app, context);
        await sleep(countdown.secondDelay);

        for (let i = countdown.countdown; i > 0; i--) {
            context.activeRace.status = 'Starting in: ' + i;
            app.routines['updateRaceMessage'](this._app, context);
            let allReady = race.players.every(x => x.ready === true);
            if (!(context.activeRace.gatekeeper || allReady)) {
                context.activeRace.status = 'INTERRUPTED: WAITING FOR PLAYERS';
                app.routines['updateRaceMessage'](this._app, context);
                return;
            }

            if (i <= 5) context.raceChannel.send(`**${i}**`).then().catch(console.error);
            await sleep(1000);
        }

        context.raceChannel.send(`**GO!!!**`).then().catch(console.error);
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

        app.routines['updateRaceMessage'](this._app, context);
        await sleep(1900);

        context.activeRace.status = 'RACE STARTED';
        app.routines['updateRaceMessage'](this._app, context);
    })();
};