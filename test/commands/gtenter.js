'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command gtenter', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: { }
    };

    const CommandGTenter = require('../../commands/gtenter');
    let gtEnterCommand = new CommandGTenter(mockApp);

    beforeEach(function () {
        mockApp.sendToTwitchChannel = function(guildId, channel, message) { };
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
    });

    context('verify gtenter command', function () {
        it('verify command has correct name', function (done) {
            expect(gtEnterCommand.commandName).to.equal('gtenter');
            done();
        });

        it('verify command is race command', function (done) {
            expect(gtEnterCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify gtenter cannot be executed unless it originates from Twitch', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    gtRunner: null,
                    restream: null,
                    players: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtenter`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(gtEnterCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.TWITCH;

            expect(gtEnterCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtenter cannot be executed unless the guess game is enabled', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: false,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    gtRunner: null,
                    restream: null,
                    players: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtenter`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtEnterCommand.isCommandValid(context)).to.be.false;

            context.activeRace.guessGameEnabled = true;

            expect(gtEnterCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtenter cannot be executed if the guess game has not been started', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: false,
                    guessGameFinished: false,
                    gtRunner: null,
                    restream: null,
                    players: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtenter`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtEnterCommand.isCommandValid(context)).to.be.false;

            context.activeRace.guessGameStarted = true;

            expect(gtEnterCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtenter cannot be executed for ladder and invitational races', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    gtRunner: null,
                    restream: null,
                    players: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtenter`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtEnterCommand.isCommandValid(context)).to.be.true;

            context.activeRace.ladder = true;

            expect(gtEnterCommand.isCommandValid(context)).to.be.false;

            context.activeRace.ladder = false;
            context.activeRace.invitational = true;

            expect(gtEnterCommand.isCommandValid(context)).to.be.false;

            done();
        });

        it('verify gtenter does not pay attention to the guessGameFinished variable', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    gtRunner: null,
                    restream: null,
                    players: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtenter`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtEnterCommand.isCommandValid(context)).to.be.true;

            context.activeRace.guessGameFinished = true;

            expect(gtEnterCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtenter does not execute when another channel has executed gtenter', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    gtRunner: '#phantomryu',
                    restream: null,
                    players: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtenter`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtEnterCommand.isCommandValid(context)).to.be.true;

            gtEnterCommand.executeCommand(context);

            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, context.messageChannel, mockApp.config['gtGuessEnter'])).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
        });

        it('verify gtenter does not execute when a channel other than a player\'s channel or the restream channel triggers it', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    gtRunner: null,
                    restream: null,
                    players: [
                        {
                            username: "jexreffy",
                            twitch: "#jexreffy"
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtenter`,
                messageChannel: '#phantomryu',
                origination: mockApp.TWITCH,
                username: `phantomryu`
            }

            expect(gtEnterCommand.isCommandValid(context)).to.be.true;

            gtEnterCommand.executeCommand(context);

            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, context.messageChannel, mockApp.config['gtGuessEnter'])).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;

            context.activeRace.restream = '#TheCrystalCompany'

            expect(gtEnterCommand.isCommandValid(context)).to.be.true;

            gtEnterCommand.executeCommand(context);

            expect(sendStub.calledTwice).to.be.true;
            expect(sendStub.calledWith(context.guildId, context.messageChannel, mockApp.config['gtGuessEnter'])).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
        });

        it('verify gtenter executes correctly when sent from the restream channel', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    gtRunner: null,
                    restream: '#TheCrystalCompany',
                    players: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtenter`,
                messageChannel: '#thecrystalcompany',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtEnterCommand.isCommandValid(context)).to.be.true;

            gtEnterCommand.executeCommand(context);

            expect(context.activeRace.gtRunner).to.equal(context.messageChannel);
            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, context.messageChannel, mockApp.config['gtGuessEnter'])).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
        });

        it('verify gtenter executes correctly when sent from a player\'s channel', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    gtRunner: null,
                    restream: null,
                    players: [
                        {
                            username: "jexreffy",
                            twitch: "#jexreffy"
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtenter`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtEnterCommand.isCommandValid(context)).to.be.true;

            gtEnterCommand.executeCommand(context);

            expect(context.activeRace.gtRunner).to.equal(context.messageChannel);
            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, context.messageChannel, mockApp.config['gtGuessEnter'])).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
        });
    });
});