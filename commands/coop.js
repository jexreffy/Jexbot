'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandTeams extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'coop';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD &&
            !context.activeRace.started &&
            !context.activeRace.invitational &&
            this._app.config['referees'].includes(context.username);
    }

    executeCommand(context) {
        if (context.activeRace.players.length % 2 !== 0) {
            context.raceChannel.send(`**${this._app.config['teamPlayerError'].replace('Teams', 'Co-op')}**`).then().catch(console.error);
            return;
        }

        context.activeRace.teams = true;

        let playerCount = 2;
        let teamCount = context.activeRace.players.length / playerCount;

        this._app.routines['generateTeams'](this._app, context, playerCount);

        context.raceChannel.send(`**${this._app.config['teamGenerated']}**`).then().catch(console.error);
        this._app.db.setRaceData(context.guildId, context.activeRace);
        this._app.routines['updateRaceMessage'](this._app, context);
    }
}