'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandDone extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'done';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let player = context.activeRace.players.find(x => x.username === context.username);

        return context.origination === this._app.DISCORD &&
               context.activeRace.started &&
               !context.activeRace.finished &&
               player && !player.finished && !player.forfeited;
    }

    executeCommand(context) {
        let player = context.activeRace.players.find(x => x.username === context.username);

        if (context.activeRace.teams && context.activeRace.relay) {
            let hasFinished = context.activeRace.players.filter(x => x.team === player.team && x.finished);

            if (player.leg !== hasFinished.length) return;
        }

        player.finished = true;
        context.activeRace.remainingPlayers -= 1;

        let time = Date.now() - context.activeRace.startedAt;
        if (time < 0) {
            time = 0;
        }

        let category = context.activeRace.category;
        if (context.activeRace.teams && context.activeRace.relay) {
            category = context.activeRace.legs[player.leg].category;
            let teamTime = 0;
            context.activeRace.players.forEach(x => {
                if (player.team === x.team && x.finished) {
                    teamTime += x.time;
                }
            })

            player.time = (time / 1000) * 1000 - ((player.leg === 0) ? 0 : teamTime);

            this._app.routines['broadcastMessage'](this._app, context, `${context.username} has finished with an individual time of ${this._app.routines['getRaceTime'](player.time)} and an overall time of ${this._app.routines['getRaceTime'](time)}.`, true);
        } else {
            player.time = (time / 1000) * 1000; //Floor to the nearest second for record keeping purposes.

            this._app.routines['broadcastMessage'](this._app, context, `${context.username} has finished with a time of ${this._app.routines['getRaceTime'](time)}.`, true);
        }

        if (this._app.db.getPlayerPB(context.username, category) > player.time) {
            this._app.db.setPlayerPB(context.username, category, player.time);
        }

        if (context.activeRace.teams) {
            let allDone = true;
            context.activeRace.players.forEach(x => {
                if (player.team === x.team) {
                    allDone = allDone && x.finished;
                }
            })

            if (allDone) {
                this._app.routines['broadcastMessage'](this._app, context, `Team ${(player.team + 1)} has finished.`, true);
            } else if (context.activeRace.relay) {
                context.activeRace.legStartTime[player.team] = Date.now() + this._app.config['relayLegDelaySeconds'] * 1000;

                let thisMember = this._app.findDiscordMember(context.guildId, player.username);
                this._app.sendToDiscordRaceChannel(context.guildId, `<@${thisMember.id}> You mush let the credits run to completion **WITHOUT** fast forwarding.`);

                let nextPlayer = context.activeRace.players.find(x => x.team === player.team && x.leg === player.leg + 1);
                let nextMember = this._app.findDiscordMember(context.guildId, nextPlayer.username);
                this._app.sendToDiscordRaceChannel(context.guildId, `<@${nextMember.id}> ${player.username} has finished. You will be able to start your leg of the relay in ${this._app.config['relayLegDelaySeconds'] / 60} minutes.`);

                let allFinished = true;

                context.activeRace.players.forEach(x => {
                    if (player.leg === x.leg && player.team !== x.team) {
                        allFinished = allFinished && x.finished;
                    }
                });

                if (allFinished) {
                    context.activeRace.players.forEach(x => {
                        if (player.leg === x.leg && player.team !== x.team && x.forfeited) {
                            context.activeRace.legStartTime[x.team] = Date.now() + (this._app.config['relayLegDelaySeconds'] + this._app.config['relayForfeitDelaySeconds']) * 1000;

                            let nextPlayer = context.activeRace.players.find(y => y.team === x.team && y.leg === x.leg + 1);
                            let nextForfeit = this._app.findDiscordMember(context.guildId, nextPlayer.username);
                            this._app.sendToDiscordRaceChannel(context.guildId, `<@${nextForfeit.id}> ${player.username} has finished. You will be able to start your leg of the relay in ${(this._app.config['relayLegDelaySeconds'] + this._app.config['relayForfeitDelaySeconds']) / 60} minutes.`);
                        }
                    });
                }
            }
        }

        this._app.routines['onRunnerFinished'](this._app, context, player);

        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}