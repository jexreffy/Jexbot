'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandTeams extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'teams';
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
        if (context.activeRace.invitational && context.activeRace.players.length <= 0) {
            context.activeRace.teams = true;
            this._app.db.setRaceData(context.guildId, context.activeRace);
            this._app.routines['updateRaceMessage'](this._app, context);
            return;
        } else if (context.activeRace.players.length > this._app.config['teamPlayers'].length || this._app.config['teamPlayers'][context.activeRace.players.length] <= 0){
            this._app.sendToDiscordRaceChannel(context.guildId, `**${this._app.config['teamPlayerError']}**`).then().catch(console.error);
            return;
        }

        context.activeRace.teams = true;

        let playerCount = this._app.config['teamPlayers'][context.activeRace.players.length];
        let teamCount = context.activeRace.players.length / playerCount;

        this._app.routines['generateTeams'](this._app, context, playerCount);

        this._app.sendToDiscordRaceChannel(context.guildId, `**${this._app.config['teamGenerated']}**`).then().catch(console.error);
        this._app.db.setRaceData(context.guildId, context.activeRace);
        this._app.routines['updateRaceMessage'](this._app, context);
    }
}