'use strict'
const JexCron = require('../cron/cron');

module.exports = class CronConnectToTwitch extends JexCron {
    constructor(app) {
        super(app);
    }

    get cronName() {
        return 'connectToTwitch';
    }

    get isGuildBased() {
        return true;
    }

    shouldTick(context) {
        let isConnected = this._app.isConnectedToTwitch(context.guildId);

        return (context.activeRace.connected && !isConnected) || (!context.activeRace.connected && isConnected);
    }

    tick(context) {
        if (context.activeRace.connected) {
            this._app.connectToTwitch(context.guildId);
        } else {
            this._app.disconnectFromTwitch(context.guildId);
        }
    }
}