'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('start', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: { }
    };

    const CommandStart = require('../../commands/start');
    let startCommand = new CommandStart(mockApp);

    beforeEach(function () {
        mockApp.routines.startRace = function(app, context) { };
    });

    context('verify start command', function () {
        it('verify command has correct name', function (done) {
            expect(startCommand.commandName).to.equal('start');
            done();
        });

        it('verify command is race command', function (done) {
            expect(startCommand.isRaceCommand).to.equal(true);
            done();
        });

        it('verify start cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    gatekeeper: 'jexreffy'
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.start`,
                messageChannel: null,
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(startCommand.isCommandValid(context)).to.equal(false);

            context.origination = mockApp.DISCORD;

            expect(startCommand.isCommandValid(context)).to.equal(true);

            done();
        });

        it('verify start cannot be executed after the race has started', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    gatekeeper: 'jexreffy'
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.start`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(startCommand.isCommandValid(context)).to.equal(true);

            context.activeRace.started = true;

            expect(startCommand.isCommandValid(context)).to.equal(false);

            done();
        });

        it('verify start cannot be executed unless the gatekeeper triggers it', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    gatekeeper: 'jexreffy'
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.start`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `TheLostCarol`
            }

            expect(startCommand.isCommandValid(context)).to.equal(false);

            context.username = 'jexreffy'

            expect(startCommand.isCommandValid(context)).to.equal(true);

            done();
        });

        it('verify start executes correctly', async () => {
            let startRaceStub = sinon.stub(mockApp.routines, 'startRace');

            let context = {
                activeRace: {
                    started: false,
                    gatekeeper: 'jexreffy'
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.start`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(startCommand.isCommandValid(context)).to.equal(true);

            startCommand.executeCommand(context);

            expect(startRaceStub.calledOnce).to.be.true;
        });
    });
});