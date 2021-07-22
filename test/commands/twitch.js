'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command twitch', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    const CommandTwitch = require('../../commands/twitch');
    let twitchCommand = new CommandTwitch(mockApp);

    beforeEach(function () {
        mockApp.db = {
            getPlayerStreaming: function(username) { },
            getPlayerTwitch: function(username) { },
            setPlayerTwitch: function(username, twitchOn) { },
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines = {
            updateRaceMessage: function (app, context) { }
        };
    });

    context('verify twitch command', function () {
        it('verify command has correct name', function (done) {
            expect(twitchCommand.commandName).to.equal('twitch');
            done();
        });

        it('verify command is race command', function (done) {
            expect(twitchCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify twitch cannot be executed unless it originates from Discord', function (done) {
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
                message: `!twitch jexreffy15`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(twitchCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.DISCORD;

            expect(twitchCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify twitch cannot be executed if the race has started', function (done) {
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
                message: `!twitch jexreffy15`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(twitchCommand.isCommandValid(context)).to.be.false;

            context.activeRace.started = false;

            expect(twitchCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify twitch cannot be executed if the user is not in the race', function (done) {
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
                message: `!twitch jexreffy15`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(twitchCommand.isCommandValid(context)).to.be.false;

            context.activeRace.players[0].username = 'jexreffy';

            expect(twitchCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify twitch cannot be executed if a twitch name is not provided with the command', function (done) {
            let getStreamingStub = sinon.stub(mockApp.db, 'getPlayerStreaming').returns(true);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');
            let setTwitchStub = sinon.stub(mockApp.db, 'setPlayerTwitch');
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
                message: `!twitch`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(twitchCommand.isCommandValid(context)).to.be.true;

            twitchCommand.executeCommand(context);

            expect(context.activeRace.multistream).to.equal('https://multistre.am/');
            expect(context.activeRace.players[0].twitch).to.be.undefined;
            expect(getStreamingStub.notCalled).to.be.true;
            expect(getTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(updateStub.notCalled).to.be.true;

            done();
        });

        it('verify twitch executes correctly when the user is streaming', function (done) {
            let getStreamingStub = sinon.stub(mockApp.db, 'getPlayerStreaming').returns(true);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');
            let setTwitchStub = sinon.stub(mockApp.db, 'setPlayerTwitch');
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
                message: `!twitch jexreffy15`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(twitchCommand.isCommandValid(context)).to.be.true;

            twitchCommand.executeCommand(context);

            expect(context.activeRace.multistream).to.equal('https://multistre.am/jexreffy15/');
            expect(context.activeRace.players[0].twitch).to.equal('#jexreffy15');
            expect(getStreamingStub.calledOnce).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
            expect(setTwitchStub.calledWith('jexreffy', 'jexreffy15')).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });

        it('verify streaming executes correctly when the user is not streaming', function (done) {
            let getStreamingStub = sinon.stub(mockApp.db, 'getPlayerStreaming').returns(false);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');
            let setTwitchStub = sinon.stub(mockApp.db, 'setPlayerTwitch');
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
                message: `!twitch jexreffy15`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(twitchCommand.isCommandValid(context)).to.be.true;

            twitchCommand.executeCommand(context);

            expect(context.activeRace.multistream).to.equal('https://multistre.am/');
            expect(context.activeRace.players[0].twitch).to.equal('#jexreffy15');
            expect(getStreamingStub.calledOnce).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
            expect(setTwitchStub.calledWith('jexreffy', 'jexreffy15')).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });
    });
});