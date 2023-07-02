'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandDone extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'ff';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        let player = context.activeRace.players.find(x => x.discordId === context.userId);

        return context.origination === this._app.DISCORD &&
               context.activeRace.started &&
               !context.activeRace.finished &&
               player && !player.finished && !player.forfeited;
    }

    executeCommand(context) {
        let player = context.activeRace.players.find(x => x.discordId === context.userId);

        player.forfeited = true;
        context.activeRace.remainingPlayers -= 1;

        let username = this._app.db.getPlayerUsername(context.userId);

        this._app.routines['broadcastMessage'](this._app, context,  `${username} has forfeited.`, true, true);

        if (context.activeRace.teams && !context.activeRace.relay) {
            let anyForfeit = false;
            context.activeRace.players.forEach(x => {
                if (player.team === x.team) {
                    anyForfeit = anyForfeit || (x.forfeited !== undefined && x.forfeited);
                }
            })
            if (!anyForfeit) {
                this._app.routines['broadcastMessage'](this._app, context,  `Team ${(player.team + 1)} has forfeited.`, true, true);
            }
        } else if (context.activeRace.teams && context.activeRace.relay) {
            player.finished = true;

            let allDone = true;
            context.activeRace.players.forEach(x => {
                if (player.team === x.team) {
                    allDone = allDone && x.finished;
                }
            })
            if (allDone) {
                this._app.routines['broadcastMessage'](this._app, context,  `Team ${(player.team + 1)} has forfeited.`, true, true);
            } else {
                let time = Date.now() - context.activeRace.startedAt;
                if (time < 0) {
                    time = 0;
                }

                let teamTime = 0;
                context.activeRace.players.forEach(x => {
                    if (player.team === x.team &&
                        player.leg > x.leg &&
                        x.finished !== undefined &&
                        x.finished) {
                        teamTime += x.time;
                    }
                })

                player.time = (time / 1000) * 1000 - ((player.leg === 0) ? 0 : teamTime);

                let allFinished = true;
                let allForfeit = true;

                context.activeRace.players.forEach(x => {
                    if (player.leg === x.leg && player.team !== x.team) {
                        allFinished = allFinished && (x.finished !== undefined && x.finished);
                        allForfeit = allForfeit && (x.forfeited !== undefined && x.forfeited);
                    }
                });

                if (allFinished) {
                    if (allForfeit) {
                        context.activeRace.players.forEach(x => {
                            if (player.leg === x.leg) {
                                context.activeRace.legStartTime[player.team] = Date.now() + (this._app.config['relayLegDelaySeconds']) * 1000;

                                this._app.sendToDiscordRaceChannel(context.guildId, `<@${x.discordId}> ${username} has forfeited. You will be able to start your leg of the relay in ${this._app.config['relayLegDelaySeconds'] / 60} minutes.`);
                            }
                        });
                    } else {
                        context.activeRace.players.forEach(x => {
                            if (player.leg === x.leg && x.forfeited) {
                                context.activeRace.legStartTime[x.team] = Date.now() + (this._app.config['relayLegDelaySeconds'] + this._app.config['relayForfeitDelaySeconds']) * 1000;

                                let nextPlayer = context.activeRace.players.find(y => y.team === x.team && y.leg === x.leg + 1);
                                this._app.sendToDiscordRaceChannel(context.guildId, `<@${nextPlayer.discordId}> ${username} has finished. You will be able to start your leg of the relay in ${(this._app.config['relayLegDelaySeconds'] + this._app.config['relayForfeitDelaySeconds']) / 60} minutes.`);
                            }
                        });
                    }
                }
            }
        }

        this._app.routines['onRunnerFinished'](this._app, context, player);

        this._app.db.setRaceData(context.guildId, context.activeRace);
    }
}