'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandGTEnter extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'gtenter';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let result = "";

        if (context.origination !== this._app.TWITCH) {
            result = "Twitch must be origination of command";
        } else if (context.activeRace.ladder || context.activeRace.invitational) {
            result = "Command not valid for Ladder or Invitational Races";
        } else if (!context.activeRace.started) {
            result = "Current race has not started";
        } else if (context.activeRace.finished) {
            result = "Current race has finished";
        } else if (!context.activeRace.guessGameEnabled) {
            result = "GTBK Guessing Game is not enabled for this race";
        } else if (!context.activeRace.guessGameStarted) {
            result = "GTBK Guessing Game has not started";
        }

        return result;
    }

    executeCommand(context) {
        this._app.sendToTwitchChannel(context.guildId, context.messageChannel, this._app.config['gtGuessEnter']).then().catch(console.error);

        if (context.activeRace.gtRunner) return;

        let player = context.activeRace.players.find(x => x.twitch === context.messageChannel);

        if ((context.activeRace.restream && context.messageChannel.toLowerCase() === context.activeRace.restream.toLowerCase()) || player) {
            context.activeRace.gtRunner = context.messageChannel;
            this._app.db.setRaceData(context.guildId, context.activeRace);
        }
    }
}