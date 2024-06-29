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
        let result = "";

        if (context.origination === this._app.TWITCH) {
            return result;
        } else if (context.activeRace.started) {
            result = "Current race has started";
        } else {
            let refereeRole = this._app.getRefereeRole(context.guildId);
            let member = this._app.findDiscordMemberById(context.guildId, context.userId);
            let hasRole = member.roles.cache.some(x => x.name === refereeRole.name);

            if (!hasRole) {
                result = "User is not a referee";
            }
        }

        return result;
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

            this._app.sendToTwitchChannel(context.guildId, context.messageChannel, message).then().catch(console.error);
        } else {
            let match = context.message.match(/^[.!](\bcrew\b) ([a-zA-Z0-9_]{4,30})/i);

            if (!match || match.length <= 2) return;

            let crewName = match[2];

            let crew = context.activeRace.crew.find(x => x.username === crewName);

            if (crew) return;

            let newCrew = {
                username: crewName
            };

            context.activeRace.crew.push(newCrew);

            let userTwitch = this._app.db.getPlayerTwitch(crewName);
            if (userTwitch) {
                newCrew.twitch = `#${userTwitch}`;
            }

            this._app.db.setRaceData(context.guildId, context.activeRace);
            this._app.routines['updateRaceMessage'](this._app, context);
        }
    }
}