'use strict'
const JexCron = require('../cron/cron');

module.exports = class CronGTAnnounce extends JexCron {
    constructor(app) {
        super(app);
    }

    get cronName() {
        return 'gtAnnounce';
    }

    get isGuildBased() {
        return true;
    }

    shouldTick(context) {
        return context.activeRace.started &&
               !context.activeRace.finished &&
               !(context.activeRace.ladder || context.activeRace.invitational) &&
               context.activeRace.guessGameEnabled && !context.activeRace.guessGameStarted &&
               (Math.floor(Date.now() - context.activeRace.startedAt) / 1000) > this._app.config['minimumGuessStartSeconds'];
    }

    tick(context) {
        context.activeRace.guessGameStarted = true;
        this._app.routines['broadcastMessage'](this._app, context, this._app.config['gtGuessIntro'], false);
        return true;
    }
}