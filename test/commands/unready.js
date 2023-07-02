'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command unready', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    const CommandUnready = require('../../commands/unready');
    let unreadyCommand = new CommandUnready(mockApp);

    beforeEach(function () {
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines = {
            updateRaceMessage: function (app, context) { }
        };
    });

    context('verify unready command', function () {
        it('verify command has correct name', function (done) {
            expect(unreadyCommand.commandName).to.equal('unready');
            done();
        });

        it('verify command is race command', function (done) {
            expect(unreadyCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify unready cannot be executed unless it originates from Discord', function (done) {
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
                message: `!unready`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(unreadyCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.DISCORD;

            expect(unreadyCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify unready cannot be executed if the race has started', function (done) {
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
                message: `!unready`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(unreadyCommand.isCommandValid(context)).to.be.false;

            context.activeRace.started = false;

            expect(unreadyCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify unready cannot be executed if the user is not in the race', function (done) {
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
                message: `!unready`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(unreadyCommand.isCommandValid(context)).to.be.false;

            context.activeRace.players[0].discordId = `0`;

            expect(unreadyCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify unready executes correctly', function (done) {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy',
                            ready: true
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

            expect(unreadyCommand.isCommandValid(context)).to.be.true;

            unreadyCommand.executeCommand(context);

            expect(context.activeRace.players[0].ready).to.be.false;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });
    });
});