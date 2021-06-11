'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandGTBK extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'gtbk';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.TWITCH &&
               context.activeRace.guessGameEnabled &&
               context.activeRace.guessGameStarted;
    }

    executeCommand(context) {
        let match = message.match(/^[.!](\bgtbk\b) ([0-9]{1,2})/i);
        let guess = parseInt(match[2]);

        if (context.activeRace.ladder || context.activeRace.invitational) {
            context.activeRace.gtbk = guess;
            context.activeRace.gtRunner = "TheCrystalCompany";

            this._app.routines['gtbkWinner'](this._app, context);
            this._app.db.setRaceData(context.guildId, context.activeRace);
        } else if (context.activeRace.gtRunner !== null) {
            let response = this._app.config['gtGuessFound'].replace('LOCATION', guess);

            context.twitchClient.say(context.messageChannel, response).then().catch(console.error);

            if (context.activeRace.gtbk >= 0) return;

            let player = context.activeRace.players.find(x => x.twitch === context.messageChannel);

            if ((context.messageChannel.toLowerCase() === context.activeRace.restream.toLowerCase() &&
                context.activeRace.gtRunner === context.activeRace.restream.toLowerCase()) ||
                (player && context.activeRace.gtRunner && context.activeRace.gtRunner === player.twitch)) {
                context.activeRace.gtbk = guess;

                if (context.activeRace.spoilersAllowed) {
                    this._app.routines['gtbkWinner'](this._app, context);
                }

                this._app.db.setRaceData(context.guildId, context.activeRace);
            }
        }
    }
}