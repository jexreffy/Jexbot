'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command streaming', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    const CommandStreaming = require('../../commands/streaming');
    let streamingCommand = new CommandStreaming(mockApp);

    beforeEach(function () {
        mockApp.db = {
            setPlayerStreaming: function(username, isStreaming) { }
        };
        mockApp.routines = {
            updateRaceMessage: function (app, context) { }
        };
    });

    context('verify streaming command', function () {
        it('verify command has correct name', function (done) {
            expect(streamingCommand.commandName).to.equal('streaming');
            done();
        });

        it('verify command is race command', function (done) {
            expect(streamingCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify streaming cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming on`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(streamingCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.DISCORD;

            expect(streamingCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify streaming cannot be executed if the race has started', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming on`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(streamingCommand.isCommandValid(context)).to.be.false;

            context.activeRace.started = false;

            expect(streamingCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify streaming cannot be executed if the user is not in the race', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    players: [
                        {
                            discordId: `1`,
                            username: 'phantomryu'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming on`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(streamingCommand.isCommandValid(context)).to.be.false;

            context.activeRace.players[0].discordId = `0`;

            expect(streamingCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify streaming cannot be executed if on or off is not provided with the command', function (done) {
            let setStreamingStub = sinon.stub(mockApp.db, 'setPlayerStreaming');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(streamingCommand.isCommandValid(context)).to.be.true;

            streamingCommand.executeCommand(context);

            expect(setStreamingStub.notCalled).to.be.true;
            expect(updateStub.notCalled).to.be.true;

            done();
        });

        it('verify streaming executes correctly setting it on', function (done) {
            let setStreamingStub = sinon.stub(mockApp.db, 'setPlayerStreaming');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming on`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(streamingCommand.isCommandValid(context)).to.be.true;

            streamingCommand.executeCommand(context);

            expect(setStreamingStub.calledWith(`0`, true)).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });


        it('verify streaming executes correctly setting it off', function (done) {
            let setStreamingStub = sinon.stub(mockApp.db, 'setPlayerStreaming');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming off`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(streamingCommand.isCommandValid(context)).to.be.true;

            streamingCommand.executeCommand(context);

            expect(setStreamingStub.calledWith(`0`, false)).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });
    });
});