'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandRestream extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'restream';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               !context.activeRace.started &&
               this._app.config['referees'].includes(context.username);
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\brestream\b) ((\bon\b)|(\boff\b))/i);

        if (!match || match.length <= 2) return;

        let isRestream = match[3] === 'on';

        context.activeRace.restream = isRestream ? this._app.config['guilds'][context.guildId]['restreamChannel'] : null;

        this._app.db.setRaceData(context.guildId, context.activeRace);
        this._app.routines['updateRaceMessage'](this._app, context);
    }
}