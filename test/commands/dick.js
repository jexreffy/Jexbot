'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');
const getRandom = require('../../common/getRandom');

describe('command dick', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {
            getRandom: getRandom
        },
    };

    const CommandDick = require('../../commands/dick');
    let dickCommand = new CommandDick(mockApp);

    beforeEach(function () {
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines = {
            getRandom: getRandom,
            broadcastTwitch: function(app, context, message) { },
            updateRaceMessage: function (app, context) { }
        };
    });

    context('verify dick command', function () {
        it('verify command has correct name', function (done) {
            expect(dickCommand.commandName).to.equal('dick');
            done();
        });

        it('verify command is race command', function (done) {
            expect(dickCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify dick can originates from Discord or Twitch', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    dickCount: 0,
                    lastDickTime: null
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!dick`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(dickCommand.isCommandValid(context)).to.be.true;

            context.origination = mockApp.TWITCH;

            expect(dickCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify dick cannot be executed unless the race has started', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    dickCount: 0,
                    lastDickTime: null
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!dick`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(dickCommand.isCommandValid(context)).to.be.false;

            context.activeRace.started = true;

            expect(dickCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify dick cannot be called if it is not outside the minimum new dick window', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    dickCount: 0,
                    lastDickTime: Date.now() - mockApp.config['minimumNewDickSeconds'] * 1000 + 1000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!dick`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(dickCommand.isCommandValid(context)).to.be.false;

            context.activeRace.lastDickTime -= 2000;

            expect(dickCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify dick executes correctly', async () => {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastTwitch');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: true,
                    dickCount: 0,
                    lastDickTime: null
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!dick`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(dickCommand.isCommandValid(context)).to.be.true;

            dickCommand.executeCommand(context);

            expect(context.activeRace.lastDickTime).to.not.be.null;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;
        });
    });
});