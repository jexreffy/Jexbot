'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command gtbk', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: { }
    };

    const CommandGTBK = require('../../commands/gtbk');
    let gtbkCommand = new CommandGTBK(mockApp);

    beforeEach(function () {
        mockApp.sendToTwitchChannel = function(guildId, channel, message) { };
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines = {
            gtbkWinner: function (app, context) { }
        };
    });

    context('verify gtbk command', function () {
        it('verify command has correct name', function (done) {
            expect(gtbkCommand.commandName).to.equal('gtbk');
            done();
        });

        it('verify command is race command', function (done) {
            expect(gtbkCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify gtbk can only be executed from Twitch', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    restream: null,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    spoilersAllowed: false,
                    gtbk: -1,
                    gtRunner: null,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.TWITCH;

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtbk cannot be executed unless the guess game is enabled', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    restream: null,
                    guessGameEnabled: false,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    spoilersAllowed: false,
                    gtbk: -1,
                    gtRunner: null,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.false;

            context.activeRace.guessGameEnabled = true;

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtbk cannot be executed if the guess game has not been started', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    restream: null,
                    guessGameEnabled: true,
                    guessGameStarted: false,
                    guessGameFinished: false,
                    spoilersAllowed: false,
                    gtbk: -1,
                    gtRunner: null,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.false;

            context.activeRace.guessGameStarted = true;

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtbk does not pay attention to the guessGameFinished variable', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    restream: null,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    spoilersAllowed: false,
                    gtbk: -1,
                    gtRunner: null,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            context.activeRace.guessGameFinished = true;

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gtbk cannot be executed if a number is not provided with the command', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    restream: null,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    spoilersAllowed: false,
                    gtbk: -1,
                    gtRunner: null,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(-1);
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            done();
        });

        it('verify gtbk cannot be executed if a number outside of [1, 22] is provided', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    restream: null,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    spoilersAllowed: false,
                    gtbk: -1,
                    gtRunner: null,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk 0`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(-1);
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            context.message = `!gtbk -1`;

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(-1);
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            context.message = `!gtbk 23`;

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(-1);
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            context.message = `!gtbk 42`;

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(-1);
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            done();
        });

        it('verify gtbk cannot be executed if gtRunner is not set', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    restream: '#jexreffy',
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    spoilersAllowed: false,
                    gtbk: -1,
                    gtRunner: null,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk 1`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(-1);
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            done();
        });

        it('verify gtbk cannot be executed if gtRunner does not match an active player', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    restream: null,
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    spoilersAllowed: false,
                    gtbk: -1,
                    gtRunner: '#phantomryu',
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [
                        {
                            username: "jexreffy",
                            twitch: "#jexreffy"
                        }
                    ],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk 3`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(-1);
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            context.activeRace.gtRunner = '#jexreffy'

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(3);
            expect(sendTwitchStub.calledTwice).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            done();
        });

        it('verify gtbk cannot be executed if gtRunner does not match the restream channel', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    restream: '#phantomryu',
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    spoilersAllowed: false,
                    gtbk: -1,
                    gtRunner: '#jexreffy',
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk 12`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(-1);
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            context.activeRace.restream = '#jexreffy'

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(12);
            expect(sendTwitchStub.calledTwice).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            done();
        });

        it('verify gtbk can be executed if a number inside of [1, 22] is provided', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    restream: '#jexreffy',
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    spoilersAllowed: false,
                    gtbk: -1,
                    gtRunner: '#jexreffy',
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk 1`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(1);
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            done();
        });

        it('verify gtbk only announces the winner when spoilers are allowed', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    restream: '#jexreffy',
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    spoilersAllowed: true,
                    gtbk: -1,
                    gtRunner: '#jexreffy',
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk 9`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(9);
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(winnerStub.calledOnce).to.be.true;

            done();
        });

        it('verify gtbk only responds but does not reset the value if another channel calls it', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false,
                    restream: '#jexreffy',
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    spoilersAllowed: false,
                    gtbk: 21,
                    gtRunner: '#jexreffy',
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk 15`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(21);
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            done();
        });

        it('verify gtbk works for a ladder race', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    ladder: true,
                    invitational: false,
                    restream: '#jexreffy',
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    spoilersAllowed: false,
                    gtbk: -1,
                    gtRunner: null,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk 20`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(20);
            expect(context.activeRace.gtRunner).to.equal(`TheCrystalCompany`);
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(winnerStub.calledOnce).to.be.true;

            done();
        });

        it('verify gtbk works for an invitational race', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    ladder: true,
                    invitational: false,
                    restream: '#jexreffy',
                    guessGameEnabled: true,
                    guessGameStarted: true,
                    guessGameFinished: false,
                    spoilersAllowed: false,
                    gtbk: -1,
                    gtRunner: '#jexreffy',
                    gtbkWinner: null,
                    gtbkGuess: null,
                    players: [],
                    guesses: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!gtbk 13`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            expect(gtbkCommand.isCommandValid(context)).to.be.true;

            gtbkCommand.executeCommand(context);

            expect(context.activeRace.gtbk).to.equal(13);
            expect(context.activeRace.gtRunner).to.equal(`TheCrystalCompany`);
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(winnerStub.calledOnce).to.be.true;

            done();
        });
    });
});