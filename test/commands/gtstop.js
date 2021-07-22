'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command gtstop', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: { }
    };

    const CommandGTstop = require('../../commands/gtstop');
    let gtStopCommand = new CommandGTstop(mockApp);

    beforeEach(function () {
        mockApp.sendToTwitchChannel = function(guildId, channel, message) { };
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
    });

    context('verify gtstop command', function () {
        it('verify command has correct name', function (done) {
            expect(gtStopCommand.commandName).to.equal('gtstop');
            done();
        });

        it('verify command is race command', function (done) {
            expect(gtStopCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify gtstop cannot be executed unless it originates from Twitch', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtstop`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(gtStopCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.TWITCH;

            expect(gtStopCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtstop cannot be executed unless the guess game is enabled', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    guessGameEnabled: false,
                    guessGameStarted: true,
                    guessGameFinished: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtstop`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtStopCommand.isCommandValid(context)).to.be.false;

            context.activeRace.guessGameEnabled = true;

            expect(gtStopCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtstop cannot be executed if the guess game has not been started', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    guessGameEnabled: true,
                    guessGameStarted: false,
                    guessGameFinished: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtstop`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtStopCommand.isCommandValid(context)).to.be.false;

            context.activeRace.guessGameStarted = true;

            expect(gtStopCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtstop cannot be executed if the guess game has already finished', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtstop`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtStopCommand.isCommandValid(context)).to.be.true;

            context.activeRace.guessGameStarted = false;

            expect(gtStopCommand.isCommandValid(context)).to.be.false;

            done();
        });

        it('verify gtstop executes correctly for regular race', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');

            let context = {
                activeRace: {
                    ladder: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtstop`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtStopCommand.isCommandValid(context)).to.be.true;

            gtStopCommand.executeCommand(context);

            expect(context.activeRace.guessGameFinished).to.be.true;
            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, context.messageChannel, `${mockApp.config['gtRacePrefix']} ${mockApp.config['gtStopMessage']}`)).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
        });

        it('verify gtstop executes correctly for ladder race', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');

            let context = {
                activeRace: {
                    ladder: true,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtstop`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtStopCommand.isCommandValid(context)).to.be.true;

            gtStopCommand.executeCommand(context);

            expect(context.activeRace.guessGameFinished).to.be.true;
            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, context.messageChannel, `${mockApp.config['gtLadderPrefix']} ${mockApp.config['gtStopMessage']}`)).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
        });
    });
});