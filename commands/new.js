'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandNew extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'new';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
               context.activeRace.finished &&
               this._app.config['referees'].includes(context.username);
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bnew\b) ([a-zA-Z0-9<>:]{4,20})/i);

        const guildId = context.guildId;

        this._app.routines['resetRace'](context.activeRace);

        context.activeRace.pingIndex = this._app.routines['getRandom'](this._app.config['pings'].length);
        context.activeRace.countdownIndex = this._app.routines['getRandom'](this._app.config['countdowns'].length);
        context.activeRace.mutlistream = 'https://multistre.am/';
        context.activeRace.status = 'PRE-RACE: WAITING FOR PLAYERS TO JOIN';

        this._app.routines['setRaceCategory'](this._app, context, match && match.length > 2 ? match[2] : "");

        let embed = {
            'content': "",
            'embed': {
                'color': 65280,
                'title': 'Crystal Company Race'
            }
        };

        this._app.sendToDiscordRaceChannel(`${this._app.getPingRole(guildId)} ${this._app.config['pings'][context.activeRace.pingIndex]}`).then(x => {
            this._app.sendToDiscordRaceChannel(embed).then(x => {
                context.activeRace.messageId = x.id;
                this._app.db.setRaceData(context.guildId, context.activeRace);
                this._app.routines['updateRaceMessage'](this._app, context);
            }).catch((error) => {
                console.log(error);
            });
        }).catch((error) => {
            console.log(error);
        });
    }
}