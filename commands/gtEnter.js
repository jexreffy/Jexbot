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
        return context.origination === this._app.TWITCH &&
               !context.activeRace.ladder &&
               !context.activeRace.invitational &&
               context.activeRace.started &&
               !context.activeRace.finished &&
               context.activeRace.guessGameEnabled &&
               context.activeRace.guessGameStarted;
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