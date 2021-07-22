'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command gtstart', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: { }
    };

    const CommandGTstart = require('../../commands/gtstart');
    let gtStartCommand = new CommandGTstart(mockApp);

    beforeEach(function () {
        mockApp.sendToTwitchChannel = function(guildId, channel, message) { };
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
    });

    context('verify gtstart command', function () {
        it('verify command has correct name', function (done) {
            expect(gtStartCommand.commandName).to.equal('gtstart');
            done();
        });

        it('verify command is race command', function (done) {
            expect(gtStartCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify gtstart cannot be executed unless it originates from Twitch', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    guessGameEnabled: true,
                    guessGameStarted: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtstart`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(gtStartCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.TWITCH;

            expect(gtStartCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtstart cannot be executed unless the guess game is enabled', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    guessGameEnabled: false,
                    guessGameStarted: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtstart`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtStartCommand.isCommandValid(context)).to.be.false;

            context.activeRace.guessGameEnabled = true;

            expect(gtStartCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtstart cannot be executed if the guess game is already started', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    guessGameEnabled: true,
                    guessGameStarted: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtstart`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtStartCommand.isCommandValid(context)).to.be.true;

            context.activeRace.guessGameStarted = true;

            expect(gtStartCommand.isCommandValid(context)).to.be.false;

            done();
        });

        it('verify gtstart executes correctly for regular race', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');

            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    guessGameEnabled: true,
                    guessGameStarted: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtstart`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtStartCommand.isCommandValid(context)).to.be.true;

            gtStartCommand.executeCommand(context);

            expect(context.activeRace.guessGameStarted).to.be.true;
            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, context.messageChannel, `${mockApp.config['gtRacePrefix']} ${mockApp.config['gtStartMessage']}`)).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
        });

        it('verify gtstart executes correctly for ladder race', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');

            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: true,
                    guessGameEnabled: true,
                    guessGameStarted: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtstart`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtStartCommand.isCommandValid(context)).to.be.true;

            gtStartCommand.executeCommand(context);

            expect(context.activeRace.guessGameStarted).to.be.true;
            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, context.messageChannel, `${mockApp.config['gtLadderPrefix']} ${mockApp.config['gtStartMessage']}`)).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
        });
    });
});