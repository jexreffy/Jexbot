'use strict'
const JexCommand = require('../commands/command');
const { EmbedBuilder } = require('discord.js');

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
        let refereeRole = this._app.getRacerRole(context.guildId);
        let member = this._app.findDiscordMemberById(context.guildId, context.userId);

        return context.origination === this._app.DISCORD &&
               context.activeRace.finished &&
               member.roles.cache.some(role => role.name === refereeRole.name);
    }

    executeCommand(context) {
        let match = context.message.match(/^[.!](\bnew\b) ((alttpr)|(ff4fe)) ([a-zA-Z0-9<>:]{4,20})/i);
        let game = match && match.length > 2 ? match[2] : 'alttpr';
        let category = match && match.length > 5 ? match[5] : '';

        const guildId = context.guildId;

        this._app.routines['resetRace'](context.activeRace);

        context.activeRace.pingIndex = this._app.routines['getRandom'](this._app.config['pings'].length);
        context.activeRace.countdownIndex = (category === 'ludicrousspeed') ? 3 : this._app.routines['getRandom'](this._app.config['countdowns'].length);
        context.activeRace.multistream = 'https://multistre.am/';
        context.activeRace.status = 'PRE-RACE: WAITING FOR PLAYERS TO JOIN';

        this._app.routines['setRaceCategory'](this._app, context, game, category);

        let embed = new EmbedBuilder()
            .setColor(0x57f287)
            .setTitle('Crystal Company Race');
        
        this._app.sendToDiscordRaceChannel(guildId, `${this._app.getPingRole(guildId)} ${this._app.config['pings'][context.activeRace.pingIndex]}`).then(x => {
            this._app.sendEmbedToDiscordRaceChannel(guildId, embed).then(x => {
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