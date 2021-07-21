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
            getPlayerStreaming: function(username) { },
            getPlayerTwitch: function(username) { },
            setPlayerStreaming: function(username, isStreaming) { },
            setRaceData: function(guildId, race) { }
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
                    multistream: 'https://multistre.am/',
                    players: [
                        {
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming on`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
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
                    multistream: 'https://multistre.am/',
                    players: [
                        {
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming on`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
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
                    multistream: 'https://multistre.am/',
                    players: [
                        {
                            username: 'phantomryu'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming on`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(streamingCommand.isCommandValid(context)).to.be.false;

            context.activeRace.players[0].username = 'jexreffy';

            expect(streamingCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify streaming cannot be executed if on or off is not provided with the command', function (done) {
            let getStreamingStub = sinon.stub(mockApp.db, 'getPlayerStreaming').returns(true);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');
            let setStreamingStub = sinon.stub(mockApp.db, 'setPlayerStreaming');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    multistream: 'https://multistre.am/',
                    players: [
                        {
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(streamingCommand.isCommandValid(context)).to.be.true;

            streamingCommand.executeCommand(context);

            expect(context.activeRace.multistream).to.equal('https://multistre.am/');
            expect(getStreamingStub.notCalled).to.be.true;
            expect(getTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(updateStub.notCalled).to.be.true;

            done();
        });

        it('verify streaming executes correctly setting it on and the user has twitch set', function (done) {
            let getStreamingStub = sinon.stub(mockApp.db, 'getPlayerStreaming').returns(true);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');
            let setStreamingStub = sinon.stub(mockApp.db, 'setPlayerStreaming');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    multistream: 'https://multistre.am/',
                    players: [
                        {
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming on`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(streamingCommand.isCommandValid(context)).to.be.true;

            streamingCommand.executeCommand(context);

            expect(context.activeRace.multistream).to.equal('https://multistre.am/jexreffy15/');
            expect(getStreamingStub.calledOnce).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
            expect(setStreamingStub.calledWith('jexreffy', true)).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });

        it('verify streaming executes correctly setting it on and the user does not have twitch set', function (done) {
            let getStreamingStub = sinon.stub(mockApp.db, 'getPlayerStreaming').returns(true);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns(null);
            let setStreamingStub = sinon.stub(mockApp.db, 'setPlayerStreaming');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    multistream: 'https://multistre.am/',
                    players: [
                        {
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming on`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(streamingCommand.isCommandValid(context)).to.be.true;

            streamingCommand.executeCommand(context);

            expect(context.activeRace.multistream).to.equal('https://multistre.am/jexreffy/');
            expect(getStreamingStub.calledOnce).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
            expect(setStreamingStub.calledWith('jexreffy', true)).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });

        it('verify streaming executes correctly setting it off and the user has twitch set', function (done) {
            let getStreamingStub = sinon.stub(mockApp.db, 'getPlayerStreaming').returns(false);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');
            let setStreamingStub = sinon.stub(mockApp.db, 'setPlayerStreaming');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    multistream: 'https://multistre.am/jexreffy15/',
                    players: [
                        {
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming off`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(streamingCommand.isCommandValid(context)).to.be.true;

            streamingCommand.executeCommand(context);

            expect(context.activeRace.multistream).to.equal('https://multistre.am/');
            expect(getStreamingStub.calledOnce).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
            expect(setStreamingStub.calledWith('jexreffy', false)).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });

        it('verify streaming executes correctly setting it off and the user does not have twitch set', function (done) {
            let getStreamingStub = sinon.stub(mockApp.db, 'getPlayerStreaming').returns(false);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns(null);
            let setStreamingStub = sinon.stub(mockApp.db, 'setPlayerStreaming');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    multistream: 'https://multistre.am/jexreffy/',
                    players: [
                        {
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!streaming off`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(streamingCommand.isCommandValid(context)).to.be.true;

            streamingCommand.executeCommand(context);

            expect(context.activeRace.multistream).to.equal('https://multistre.am/');
            expect(getStreamingStub.calledOnce).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
            expect(setStreamingStub.calledWith('jexreffy', false)).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });
    });
});