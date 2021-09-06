'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandSeedCode extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'seedcode';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
            !context.activeRace.started &&
            (!(context.activeRace.relay || context.activeRace.seedCode) ||
                (context.activeRace.relay && !context.activeRace.legs[context.activeRace.legs - 1].code)) &&
            this._app.config['referees'].includes(context.username);
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bseedcode\b) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100})/i);

        if (!match || match.length <= 6) return;

        let code = `<${match[2]}><${match[3]}><${match[4]}><${match[5]}><${match[6]}>`;

        if (context.activeRace.relay) {
            context.activeRace.legs[context.activeRace.legs - 1].code = code;
        } else {
            context.activeRace.seedLink = code;
        }

        this._app.db.setRaceData(context.guildId, context.activeRace);

        this._app.routines['updateRaceMessage'](this._app, context);
    }
}