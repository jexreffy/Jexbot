'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandSeedLink extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'seedlink';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
            !context.activeRace.started &&
            (!(context.activeRace.relay || context.activeRace.seedLink) ||
                (context.activeRace.relay && !context.activeRace.legs[context.activeRace.legs.length - 1].link)) &&
            this._app.config['referees'].includes(context.username);
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bseedlink\b) ("https:\/\/[a-zA-Z0-9_%\/?,.=]{4,100}")/i);
        console.log(match);

        if (!match || match.length <= 2) {
            match = context.message.match(/^[.!](\bseedlink\b) ("http:\/\/[a-zA-Z0-9_%\/?,.=]{4,100}")/i);
            console.log(match);

            if (!match || match.length <= 2) return;
        }

        let link = match[2].replace(/"/ig, '');

        if (context.activeRace.relay) {
            context.activeRace.legs[context.activeRace.legs.length - 1].link = link;
        } else {
            context.activeRace.seedLink = link;
        }

        this._app.db.setRaceData(context.guildId, context.activeRace);

        this._app.routines['updateRaceMessage'](this._app, context);
    }
}