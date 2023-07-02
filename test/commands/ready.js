'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command ready', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    const CommandReady = require('../../commands/ready');
    let readyCommand = new CommandReady(mockApp);

    beforeEach(function () {
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines = {
            startRace: function (app, context) { },
            updateRaceMessage: function (app, context) { }
        };
    });

    context('verify ready command', function () {
        it('verify command has correct name', function (done) {
            expect(readyCommand.commandName).to.equal('ready');
            done();
        });

        it('verify command is race command', function (done) {
            expect(readyCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify ready cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    gatekeeper: null,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!ready`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(readyCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.DISCORD;

            expect(readyCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify ready cannot be executed if the race has started', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    gatekeeper: null,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!unready`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(readyCommand.isCommandValid(context)).to.be.false;

            context.activeRace.started = false;

            expect(readyCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify ready cannot be executed if the user is not in the race', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    gatekeeper: null,
                    players: [
                        {
                            discordId: `1`,
                            username: 'phantomryu'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!ready`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(readyCommand.isCommandValid(context)).to.be.false;

            context.activeRace.players[0].discordId = `0`;

            expect(readyCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify ready executes correctly when not everyone is ready', function (done) {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let startStub = sinon.stub(mockApp.routines, 'startRace');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    gatekeeper: null,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy'
                        },
                        {
                            discordId: `1`,
                            username: 'TjMaelstrom'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!ready`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(readyCommand.isCommandValid(context)).to.be.true;

            readyCommand.executeCommand(context);

            expect(context.activeRace.players[0].ready).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(startStub.notCalled).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });

        it('verify ready executes correctly when everyone else is ready', function (done) {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let startStub = sinon.stub(mockApp.routines, 'startRace');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    gatekeeper: null,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy'
                        },
                        {
                            discordId: `1`,
                            username: 'TjMaelstrom',
                            ready: true
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!ready`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(readyCommand.isCommandValid(context)).to.be.true;

            readyCommand.executeCommand(context);

            expect(context.activeRace.players[0].ready).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(startStub.calledOnce).to.be.true;
            expect(updateStub.notCalled).to.be.true;

            done();
        });

        it('verify ready executes correctly when a gatekeeper is set', function (done) {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let startStub = sinon.stub(mockApp.routines, 'startRace');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    gatekeeper: 'ZephyrBlayze',
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy'
                        },
                        {
                            discordId: `1`,
                            username: 'TjMaelstrom',
                            ready: true
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!ready`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(readyCommand.isCommandValid(context)).to.be.true;

            readyCommand.executeCommand(context);

            expect(context.activeRace.players[0].ready).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(startStub.notCalled).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });
    });
});