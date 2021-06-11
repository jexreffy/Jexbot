'use strict'
const JexCron = require('../cron/cron');

module.exports = class CronRelayNext extends JexCron {
    constructor(app) {
        super(app);
    }

    get cronName() {
        return 'relayNext';
    }

    get isGuildBased() {
        return true;
    }

    shouldTick(context) {
        return context.activeRace.started &&
            !context.activeRace.finished &&
            context.activeRace.teams && context.activeRace.relay;
    }

    tick(context) {
        let now = Date.now();

        for (let i = 0; i < context.activeRace.legStartTime.length; i++) {
            let startTime = context.activeRace.legStartTime[i];
            if (startTime > 0 && startTime - now <= this._app.config['relayLegDelaySeconds'] * 500) {
                let hasFinished = context.activeRace.players.filter(x => x.team === i && x.finished);
                let nextPlayer = context.activeRace.players.find(x => x.team === i && x.leg === hasFinished.length);
                this.#countdownNextPlayer(this._app, context, nextPlayer, startTime - now, this._app.config['relayLegDelaySeconds'] / 2);
                context.activeRace.legStartTime[i] = 0;
            }
        }

        return true;
    }

    #countdownNextPlayer(app, context, nextPlayer, remainingTime, delayTime) {
        (async() => {
            let nextMember = context.raceChannel.members.find(x => x.user.username === nextPlayer.username);
            context.raceChannel.send(`${nextPlayer.username} Your leg of the relay will start in ${delayTime / 60} minutes.`).then().catch(console.error);
            let oneMinuteLeft = remainingTime - 60000;
            await app.sleep(oneMinuteLeft);

            context.raceChannel.send(`<@${nextMember.id}> Your leg of the relay will start in 60 seconds.`);
            await app.sleep(30000);

            context.raceChannel.send(`${nextPlayer.username} Your leg of the relay will start in 30 seconds.`);
            await app.sleep(20000);

            context.raceChannel.send(`${nextPlayer.username} Your leg of the relay will start in 10 seconds.`);
            await app.sleep(5000);


            for (let i = 5; i > 0; i--) {
                context.raceChannel.send(`**${nextPlayer.username} ${i}**`).then().catch(console.error);
                await app.sleep(1000);
            }

            context.raceChannel.send(`**${nextPlayer.username} GO!!!**`).then().catch(console.error);
        })();
    }
}