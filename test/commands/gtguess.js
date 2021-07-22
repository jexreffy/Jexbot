'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command gtguess', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: { }
    };

    const CommandGTguess = require('../../commands/gtguess');
    let gtGuessCommand = new CommandGTguess(mockApp);

    beforeEach(function () {
        mockApp.sendToDiscordRaceChannel = function(guildId, message) { };
        mockApp.sendToTwitchChannel = function(guildId, channel, message) { };
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines = {
            broadcastMessage: function (app, context, message, bold) { }
        };
    });

    context('verify gtguess command', function () {
        it('verify command has correct name', function (done) {
            expect(gtGuessCommand.commandName).to.equal('gtguess');
            done();
        });

        it('verify command is race command', function (done) {
            expect(gtGuessCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify gtguess can be executed from Twitch or Discord', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            context.origination = mockApp.TWITCH;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtguess cannot be executed unless the guess game is enabled', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: false,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtGuessCommand.isCommandValid(context)).to.be.false;

            context.activeRace.guessGameEnabled = true;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtguess cannot be executed if the guess game has not been started', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: false,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtGuessCommand.isCommandValid(context)).to.be.false;

            context.activeRace.guessGameStarted = true;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtguess cannot be executed if the guess game has finished', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            context.activeRace.guessGameFinished = true;

            expect(gtGuessCommand.isCommandValid(context)).to.be.false;

            done();
        });

        it('verify gtguess cannot be executed if command originated from Discord and this is either a ladder or invitational race.', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            context.activeRace.ladder = true;

            expect(gtGuessCommand.isCommandValid(context)).to.be.false;

            context.activeRace.ladder = true;
            context.activeRace.invitational = false;

            expect(gtGuessCommand.isCommandValid(context)).to.be.false;

            done();
        });

        it('verify gtguess can be executed if command originated from Twitch for any type of race.', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            context.activeRace.ladder = true;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            context.activeRace.ladder = true;
            context.activeRace.invitational = false;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtguess cannot be executed if a number is not provided with the command', function (done) {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            gtGuessCommand.executeCommand(context);

            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;

            done();
        });

        it('verify gtguess cannot be executed if a number outside of [1, 22] is provided', function (done) {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess 0`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            gtGuessCommand.executeCommand(context);

            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;

            context.message = `!gtguess -1`;

            gtGuessCommand.executeCommand(context);

            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;

            context.message = `!gtguess 23`;

            gtGuessCommand.executeCommand(context);

            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;

            context.message = `!gtguess 42`;

            gtGuessCommand.executeCommand(context);

            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;

            done();
        });

        it('verify gtguess can be executed from Twitch if a number inside of [1, 22] is provided', function (done) {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess 1`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[0]).to.equal('jexreffy');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;

            done();
        });

        it('verify gtguess can be executed from Discord if a number inside of [1, 22] is provided', function (done) {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess 2`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[1]).to.equal('jexreffy');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;

            done();
        });

        it('verify gtguess only reports to Twitch in a ladder race', function (done) {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    ladder: true,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess 5`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[4]).to.equal('jexreffy');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;

            done();
        });

        it('verify gtguess only reports to Twitch in an invitational race', function (done) {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: true,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess 22`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[21]).to.equal('jexreffy');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;

            done();
        });

        it('verify gtguess from Twitch only reports to Twitch when the user has already guessed', function (done) {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess 17`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            context.activeRace.guesses[11] = 'jexreffy';

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[16]).to.be.null;
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;

            done();
        });

        it('verify gtguess from Discord only reports to Discord when the user has already guessed', function (done) {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess 19`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            context.activeRace.guesses[6] = 'jexreffy';

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[18]).to.be.null;
            expect(sendDiscordStub.calledOnce).to.be.true;
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;

            done();
        });

        it('verify gtguess from Twitch only reports to Twitch when another user has already guessed', function (done) {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess 15`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            context.activeRace.guesses[14] = 'web_mage';

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[14]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;

            done();
        });

        it('verify gtguess from Discord only reports to Discord when another user has already guessed', function (done) {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtguess 8`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            context.activeRace.guesses[7] = 'TheLostCarol';

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;

            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[7]).to.equal('TheLostCarol');
            expect(sendDiscordStub.calledOnce).to.be.true;
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;

            done();
        });
    });
});