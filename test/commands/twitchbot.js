'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command twitchBot', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    const CommandTwitchBot = require('../../commands/twitchbot');
    let twitchBotCommand = new CommandTwitchBot(mockApp);

    beforeEach(function () {
        mockApp.db = {
            setPlayerTwitchBot: function(username, isStreaming) { }
        };
        mockApp.routines = {
            updateRaceMessage: function (app, context) { }
        };
    });

    context('verify twitchBot command', function () {
        it('verify command has correct name', function (done) {
            expect(twitchBotCommand.commandName).to.equal('twitchbot');
            done();
        });

        it('verify command is race command', function (done) {
            expect(twitchBotCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify twitchBot cannot be executed unless it originates from Discord', function (done) {
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
                message: `!twitchbot on`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(twitchBotCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.DISCORD;

            expect(twitchBotCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify twitchBot cannot be executed if the race has started', function (done) {
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
                message: `!twitchbot on`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(twitchBotCommand.isCommandValid(context)).to.be.false;

            context.activeRace.started = false;

            expect(twitchBotCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify twitchBot cannot be executed if the user is not in the race', function (done) {
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
                message: `!twitchbot on`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(twitchBotCommand.isCommandValid(context)).to.be.false;

            context.activeRace.players[0].discordId = `0`;

            expect(twitchBotCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify twitchBot cannot be executed if on or off is not provided with the command', function (done) {
            let botStub = sinon.stub(mockApp.db, 'setPlayerTwitchBot');
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
                message: `!twitchbot`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(twitchBotCommand.isCommandValid(context)).to.be.true;

            twitchBotCommand.executeCommand(context);

            expect(botStub.notCalled).to.be.true;
            expect(updateStub.notCalled).to.be.true;

            done();
        });

        it('verify twitchBot executes correctly setting it on', function (done) {
            let botStub = sinon.stub(mockApp.db, 'setPlayerTwitchBot');
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
                message: `!twitchbot on`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(twitchBotCommand.isCommandValid(context)).to.be.true;

            twitchBotCommand.executeCommand(context);

            expect(botStub.calledOnce).to.be.true;
            expect(botStub.calledWith(`0`, true)).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });

        it('verify twitchBot executes correctly setting it off', function (done) {
            let botStub = sinon.stub(mockApp.db, 'setPlayerTwitchBot');
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
                message: `!twitchbot off`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(twitchBotCommand.isCommandValid(context)).to.be.true;

            twitchBotCommand.executeCommand(context);

            expect(botStub.calledOnce).to.be.true;
            expect(botStub.calledWith(`0`, false)).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });
    });
});