'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandRunners extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'runners';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.TWITCH;
    }

    executeCommand(context) {
        let message = this._app.config['runnerMessage'] + " ";

        for (let i = 0; i < context.activeRace.players.length; i++) {
            if ((context.activeRace.teams && i === 0) || (context.activeRace.teams && i > 0 && context.activeRace.players[i - 1].team < context.activeRace.players[i].team)) {
                message += `Team ${context.activeRace.players[i].team + 1}: `;
            }

            if (context.activeRace.players[i].twitch) {
                message += `https://twitch.tv/${context.activeRace.players[i].twitch.substr(1)}${i !== context.activeRace.players.length - 1 ? ' ' : ''}`;
            } else {
                message += `https://twitch.tv/${context.activeRace.players[i].username}${i !== context.activeRace.players.length - 1 ? ' ' : ''}`;
            }
        }

        this._app.sendToTwitchChannel(context.guildId, context.messageChannel, message).then().catch(console.error);
    }
}