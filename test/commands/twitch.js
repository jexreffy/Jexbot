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
            setPlayerTwitch: function(username, twitchOn) { },
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
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!twitch jexreffy15`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
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
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!twitch jexreffy15`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
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
                    players: [
                        {
                            discordId: `1`,
                            username: 'phantomryu'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!twitch jexreffy15`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(twitchCommand.isCommandValid(context)).to.be.false;

            context.activeRace.players[0].discordId = `0`;

            expect(twitchCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify twitch cannot be executed if a twitch name is not provided with the command', function (done) {
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
                message: `!twitch`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(twitchCommand.isCommandValid(context)).to.be.true;

            twitchCommand.executeCommand(context);

            expect(updateStub.notCalled).to.be.true;

            done();
        });

        it('verify twitch executes correctly', function (done) {
            let setTwitchStub = sinon.stub(mockApp.db, 'setPlayerTwitch');
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
                message: `!twitch jexreffy15`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(twitchCommand.isCommandValid(context)).to.be.true;

            twitchCommand.executeCommand(context);

            expect(setTwitchStub.calledWith(`0`, 'jexreffy15')).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });
    });
});