'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandJoin extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'join';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD;
    }

    executeCommand(context) {
        let playerToAdd = null;
        let teamToAdd = -1;

        if (context.activeRace.invitational && this._app.config['referees'].includes(context.username)) {
            let match = message.content.match(context.activeRace.teams ? /^[.!](\bjoin\b) ([a-zA-Z0-9]{4,30}) ((1)|(2))/i : /^[.!](\bjoin\b) ([a-zA-Z0-9]{4,30})/i);

            if (match) {
                playerToAdd = match[2];
                if (context.activeRace.teams) teamToAdd = parseInt(match[3]) - 1;
            }
        } else if (!(context.activeRace.invitational || context.activeRace.locked)) {
            playerToAdd = context.username;
        }

        if (playerToAdd) {
            let player = context.activeRace.players.find(x => x.username === playerToAdd);

            if (!(context.activeRace.started || context.activeRace.finished || player)) {
                if (context.activeRace.invitational) {
                    let member = this._app.findDiscordMember(context.guildId, playerToAdd);
                    this._app.sendToDiscordRaceChannel(context.guildId, `<@${member.id}> You have been added to an invitational race`);
                } else {
                    context.activeRace.teams = false;
                }

                let newPlayer = {
                    username: playerToAdd
                };

                if (teamToAdd >= 0) {
                    newPlayer.team = teamToAdd;

                    if (context.activeRace.relay) {
                        newPlayer.leg = context.activeRace.players.filter(x => x.team === teamToAdd).length;
                    }
                }

                this._app.routines['onRunnerAdded'](this._app, context, player);
                this._app.db.setRaceData(context.guildId, context.activeRace);
                this._app.routines['updateRaceMessage'](this._app, context);
            }
        }
    }
}