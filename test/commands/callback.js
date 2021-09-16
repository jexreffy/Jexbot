'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command callback', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    const CommandCallback = require('../../commands/callback');
    let callbackCommand = new CommandCallback(mockApp);

    beforeEach(function () {
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines = {
            broadcastMessage: function (app, context, message, bold, delay) { },
            getRaceTime: function (time) { }
        };
    });

    context('verify callback command', function () {
        it('verify command has correct name', function (done) {
            expect(callbackCommand.commandName).to.equal('callback');
            done();
        });

        it('verify command is race command', function (done) {
            expect(callbackCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify callback cannot be executed unless it originates from Twitch', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    lastCallback: null
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!callback`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(callbackCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.TWITCH;

            expect(callbackCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify callback cannot be executed unless the race has started', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    lastCallback: null
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!callback`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(callbackCommand.isCommandValid(context)).to.be.false;

            context.activeRace.started = true;

            expect(callbackCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify callback cannot be called if it is not outside the minimum new callback window', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    lastCallback: Date.now() - mockApp.config['minimumNewCallbackSeconds'] * 1000 + 1000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!callback`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(callbackCommand.isCommandValid(context)).to.be.false;

            context.activeRace.lastCallback -= 2000;

            expect(callbackCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify callback executes correctly', async () => {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let getTimeStub = sinon.stub(mockApp.routines, 'getRaceTime').returns('00:48:12');

            let context = {
                activeRace: {
                    started: true,
                    lastCallback: null
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!callback`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(callbackCommand.isCommandValid(context)).to.be.true;

            callbackCommand.executeCommand(context);

            expect(context.activeRace.lastCallback).to.not.be.null;
            expect(getTimeStub.calledOnce).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(broadcastStub.calledWith(mockApp, context, `00:48:12, go back to jexreffy's stream.`, true));
        });
    });
});