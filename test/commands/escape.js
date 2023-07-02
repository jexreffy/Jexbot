'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command escape', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    const CommandEscape = require('../../commands/escape');
    let escapeCommand = new CommandEscape(mockApp);

    beforeEach(function () {
        mockApp.db = {
            setRaceData: function (guildId, race) { }
        };
        mockApp.routines = {
            updateRaceMessage: function (app, context) { }
        };
    });

    context('verify escape command', function () {
        it('verify command has correct name', function (done) {
            expect(escapeCommand.commandName).to.equal('escape');
            done();
        });

        it('verify command is race command', function (done) {
            expect(escapeCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify escape cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    escapeItem: null
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!escape`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(escapeCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.DISCORD;

            expect(escapeCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify escape cannot be executed if the race has not started', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    escapeItem: null
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!escape`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(escapeCommand.isCommandValid(context)).to.be.false;

            context.activeRace.started = true;

            expect(escapeCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify twitch cannot be executed if the escape item has already been set', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    escapeItem: 'bombs'
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!escape`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(escapeCommand.isCommandValid(context)).to.be.false;

            context.activeRace.escapeItem = null;

            expect(escapeCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify escape cannot be executed if an item is not provided', function (done) {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: true,
                    escapeItem: null
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!escape`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(escapeCommand.isCommandValid(context)).to.be.true;

            escapeCommand.executeCommand(context);

            expect(context.activeRace.escapeItem).to.be.null;
            expect(setRaceStub.notCalled).to.be.true;
            expect(updateStub.notCalled).to.be.true;

            done();
        });

        it('verify escape executes correctly', function (done) {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: true,
                    escapeItem: null
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!escape bombs`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(escapeCommand.isCommandValid(context)).to.be.true;

            escapeCommand.executeCommand(context);

            expect(context.activeRace.escapeItem).to.equal('bombs');
            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });
    });
});