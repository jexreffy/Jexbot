'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('gatekeeper', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: { }
    };

    const CommandGatekeeper = require('../../commands/gatekeeper');
    let gatekeeperCommand = new CommandGatekeeper(mockApp);

    beforeEach(function () {
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines.updateRaceMessage = function(app, context) { };
    });

    context('verify gatekeeper command', function () {
        it('verify command has correct name', function (done) {
            expect(gatekeeperCommand.commandName).to.equal('gatekeeper');
            done();
        });

        it('verify command is race command', function (done) {
            expect(gatekeeperCommand.isRaceCommand).to.equal(true);
            done();
        });

        it('verify gatekeeper cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    started: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.gatekeeper`,
                messageChannel: null,
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gatekeeperCommand.isCommandValid(context)).to.equal(false);

            context.origination = mockApp.DISCORD;

            expect(gatekeeperCommand.isCommandValid(context)).to.equal(true);

            done();
        });

        it('verify gatekeeper cannot be executed after the race has started', function (done) {
            let context = {
                activeRace: {
                    started: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.gatekeeper`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(gatekeeperCommand.isCommandValid(context)).to.equal(true);

            context.activeRace.started = true;

            expect(gatekeeperCommand.isCommandValid(context)).to.equal(false);

            done();
        });

        it('verify gatekeeper cannot be executed unless a referee triggers it', function (done) {
            let context = {
                activeRace: {
                    started: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.gatekeeper`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `TheLostCarol`
            }

            expect(gatekeeperCommand.isCommandValid(context)).to.equal(false);

            context.username = 'jexreffy'

            expect(gatekeeperCommand.isCommandValid(context)).to.equal(true);

            done();
        });

        it('verify gatekeeper executes correctly', async () => {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateEmbedStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.gatekeeper`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(gatekeeperCommand.isCommandValid(context)).to.equal(true);

            gatekeeperCommand.executeCommand(context);

            expect(context.activeRace.gatekeeper).to.equal('jexreffy');

            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateEmbedStub.calledOnce).to.be.true;
        });
    });
});