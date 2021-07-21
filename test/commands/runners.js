'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('runners category', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    const CommandRunners = require('../../commands/runners');
    let runnersCommand = new CommandRunners(mockApp);

    beforeEach(function () {
        mockApp.sendToTwitchChannel = function (guildId, channel, message) { };
    });

    context('verify category runners', function () {
        it('verify command has correct name', function (done) {
            expect(runnersCommand.commandName).to.equal('runners');
            done();
        });

        it('verify command is race command', function (done) {
            expect(runnersCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify runners cannot be executed unless it originates from Twitch', function (done) {
            let context = {
                activeRace: {
                    teams: false,
                    players: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!runners`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(runnersCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.TWITCH;

            expect(runnersCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify runners executes correctly for a regular race', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();

            let context = {
                activeRace: {
                    teams: false,
                    players: [
                        {
                            username: "jexreffy",
                            twitch: "#jexreffy"
                        },
                        {
                            username: "PhantomRyu",
                            twitch: "#phantomryu"
                        },
                        {
                            username: "Antissim"
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!runners`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(runnersCommand.isCommandValid(context)).to.be.true;

            runnersCommand.executeCommand(context);

            let message = mockApp.config['runnerMessage'] + " ";

            for (let i = 0; i < context.activeRace.players.length; i++) {
                if (context.activeRace.players[i].twitch) {
                    message += `https://twitch.tv/${context.activeRace.players[i].twitch.substr(1)}${i !== context.activeRace.players.length - 1 ? ' ' : ''}`;
                } else {
                    message += `https://twitch.tv/${context.activeRace.players[i].username}${i !== context.activeRace.players.length - 1 ? ' ' : ''}`;
                }
            }

            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(sendTwitchStub.calledWith(context.guildId, context.messageChannel, message)).to.be.true;

            done();
        });

        it('verify runners executes correctly for a teams race', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();

            let context = {
                activeRace: {
                    teams: false,
                    players: [
                        {
                            username: "jexreffy",
                            twitch: "#jexreffy",
                            team: 0
                        },
                        {
                            username: "PhantomRyu",
                            twitch: "#phantomryu",
                            team: 0
                        },
                        {
                            username: "TjMaelstrom",
                            twitch: "#tjmaelstrom",
                            team: 1
                        },
                        {
                            username: "Antissim",
                            team: 1
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!runners`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(runnersCommand.isCommandValid(context)).to.be.true;

            runnersCommand.executeCommand(context);

            let message = mockApp.config['runnerMessage'] + " ";

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

            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(sendTwitchStub.calledWith(context.guildId, context.messageChannel, message)).to.be.true;

            done();
        });
    });
});