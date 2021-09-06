'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandDick extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'dick';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.activeRace.started &&
               (!context.activeRace.lastDickTime ||
                   (Math.floor((Date.now() - context.activeRace.lastDickTime)) / 1000) > this._app.config['minimumNewDickSeconds']);
    }

    executeCommand(context) {
        context.activeRace.dickCount += 1;
        context.activeRace.lastDickTime = Date.now();

        this._app.db.setRaceData(context.guildId, context.activeRace);

        this._app.routines['updateRaceMessage'](this._app, context);

        let dickIndex = this._app.routines['getRandom'](this._app.config['dickMessages'].length);

        if (context.activeRace.seedRoller === 'JexBot') {
            dickIndex--;
        }

        let dickMessage = `${context.activeRace.seedRoller} ${this._app.config['dickMessages'][dickIndex].replace('RICHARD', context.activeRace.dickCount)}`;

        this._app.routines['broadcastTwitch'](this._app, context, dickMessage);
    }
}