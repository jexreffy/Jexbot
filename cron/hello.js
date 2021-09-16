'use strict'
const JexCron = require('../cron/cron');

module.exports = class CronHello extends JexCron {
    constructor(app) {
        super(app);
    }

    get cronName() {
        return 'hello';
    }

    get isGuildBased() {
        return true;
    }

    shouldTick(context) {
        return context.activeRace.started &&
               !context.activeRace.finished &&
               (!context.activeRace.lastHello ||
                   (Math.floor(Date.now() - context.activeRace.lastHello) / 1000) > this._app.config['helloInterval']);
    }

    tick(context) {
        context.activeRace.lastHello = Date.now();
        let message = context.activeRace.ladder ? this._app.config['helloLadder'] : context.activeRace.invitational ? this._app.config['helloInvitational'] : this._app.config['helloRace'];
        this._app.routines['broadcastTwitch'](this._app, context, message, false);
        return true;
    }
}