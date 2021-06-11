'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandCrew extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'crew';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let crew = context.activeRace.crew.find(x => x.username === context.username);

        return context.origination === this._app.TWITCH ||
               !(context.activeRace.started ||
                   context.activeRace.finished ||
                   crew);
    }

    executeCommand(context) {
        if (context.origination === this._app.TWITCH) {
            let message = this._app.config['crewMessage'] + " ";

            for (let i = 0; i < context.activeRace.crew.length; i++) {
                if (context.activeRace.crew[i].twitch) {
                    message += `https://twitch.tv/${context.activeRace.crew[i].twitch.substr(1)}${i !== context.activeRace.crew.length - 1 ? ' ' : ''}`;
                } else {
                    message += `https://twitch.tv/${context.activeRace.crew[i].username}${i !== context.activeRace.crew.length - 1 ? ' ' : ''}`;
                }
            }

            context.twitchClient.say(context.messageChannel, message).then().catch(console.error);
        } else {
            let newCrew = {
                username: context.username
            };

            context.activeRace.crew.push(newCrew);

            let userTwitch = this._app.db.getPlayerTwitch(context.username);
            if (userTwitch) {
                newCrew.twitch = userTwitch;
            } else {
                newCrew.twitch = context.username;
            }

            this._app.db.setRaceData(context.guildId, context.activeRace);
            this._app.routines['updateRaceMessage'](this._app, context);
        }
    }
}