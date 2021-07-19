'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../../config.json');

describe('integration GTBK Guessing Game Ladder Scenario', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: { },
        sleep: function(m) {
            return new Promise((resolve, reject) => setTimeout(resolve, m));
        }
    };

    const CommandGTstart = require('../../../commands/gtstart');
    let gtStartCommand = new CommandGTstart(mockApp);

    const CommandGTstop = require('../../../commands/gtstop');
    let gtStopCommand = new CommandGTstop(mockApp);

    const CommandGTguess = require('../../../commands/gtguess');
    let gtGuessCommand = new CommandGTguess(mockApp);

    const CommandGTBK = require('../../../commands/gtbk');
    let gtbkCommand = new CommandGTBK(mockApp);

    beforeEach(function () {
        mockApp.sendToDiscordRaceChannel = function(guildId, message) { };
        mockApp.sendToTwitchChannel = function(guildId, channel, message) { };
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines = {
            broadcastMessage: function (app, context, message, bold) { },
            gtbkWinner: function (app, context) { }
        };
    });

    context('verify that the GTBK Guessing Game works completely in a regular race', function () {
        it('verify that gtguess cannot be run until gtstart has been called', async () => {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: true,
                    invitational: false,
                    startedAt: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000,
                    restream: '#jexreffy',
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
                message: `!gtguess 11`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `lemming622`
            }

            expect(gtGuessCommand.isCommandValid(context)).to.be.false;

            await mockApp.sleep(1);

            context.message = `!gtstart`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `oddwalls`;

            expect(gtStartCommand.isCommandValid(context)).to.be.true;
            gtStartCommand.executeCommand(context);

            expect(context.activeRace.guessGameStarted).to.be.true;
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 11`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `lemming622`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[10]).to.equal('lemming622');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.calledTwice).to.be.true;
            expect(setRaceStub.calledTwice).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;
        });

        it('verify that gtguess works on multiple valid calls', async () => {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: true,
                    invitational: false,
                    startedAt: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000,
                    restream: '#jexreffy',
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
                message: `!gtstart`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `oddwalls`
            }

            expect(gtStartCommand.isCommandValid(context)).to.be.true;
            gtStartCommand.executeCommand(context);

            expect(context.activeRace.guessGameStarted).to.be.true;
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 13`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `lemming622`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[12]).to.equal('lemming622');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(2);
            expect(setRaceStub.callCount).to.equal(2);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 22`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `web_mage`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[12]).to.equal('lemming622');
            expect(context.activeRace.guesses[21]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(3);
            expect(setRaceStub.callCount).to.equal(3);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 4`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `aestolia`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[3]).to.equal('aestolia');
            expect(context.activeRace.guesses[12]).to.equal('lemming622');
            expect(context.activeRace.guesses[21]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(4);
            expect(setRaceStub.callCount).to.equal(4);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 19`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `digidude22`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[3]).to.equal('aestolia');
            expect(context.activeRace.guesses[12]).to.equal('lemming622');
            expect(context.activeRace.guesses[18]).to.equal('digidude22');
            expect(context.activeRace.guesses[21]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(5);
            expect(setRaceStub.callCount).to.equal(5);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 13`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `TheShadesAT`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[3]).to.equal('aestolia');
            expect(context.activeRace.guesses[12]).to.equal('lemming622');
            expect(context.activeRace.guesses[18]).to.equal('digidude22');
            expect(context.activeRace.guesses[21]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(6);
            expect(setRaceStub.callCount).to.equal(5);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 1`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `TheShadesAT`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[0]).to.equal('TheShadesAT');
            expect(context.activeRace.guesses[3]).to.equal('aestolia');
            expect(context.activeRace.guesses[12]).to.equal('lemming622');
            expect(context.activeRace.guesses[18]).to.equal('digidude22');
            expect(context.activeRace.guesses[21]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(7);
            expect(setRaceStub.callCount).to.equal(6);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 7`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `ZephyrBlayze`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[0]).to.equal('TheShadesAT');
            expect(context.activeRace.guesses[3]).to.equal('aestolia');
            expect(context.activeRace.guesses[6]).to.equal('ZephyrBlayze');
            expect(context.activeRace.guesses[12]).to.equal('lemming622');
            expect(context.activeRace.guesses[18]).to.equal('digidude22');
            expect(context.activeRace.guesses[21]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(8);
            expect(setRaceStub.callCount).to.equal(7);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 18`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `ZephyrBlayze`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[0]).to.equal('TheShadesAT');
            expect(context.activeRace.guesses[3]).to.equal('aestolia');
            expect(context.activeRace.guesses[6]).to.equal('ZephyrBlayze');
            expect(context.activeRace.guesses[12]).to.equal('lemming622');
            expect(context.activeRace.guesses[18]).to.equal('digidude22');
            expect(context.activeRace.guesses[21]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(9);
            expect(setRaceStub.callCount).to.equal(7);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;
        });

        it('verify that gtguess works on multiple valid and invalid calls', async () => {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: true,
                    invitational: false,
                    startedAt: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000,
                    restream: '#jexreffy',
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
                message: `!gtstart`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `oddwalls`
            }

            expect(gtStartCommand.isCommandValid(context)).to.be.true;
            gtStartCommand.executeCommand(context);

            expect(context.activeRace.guessGameStarted).to.be.true;
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `lemming622`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(1);
            expect(setRaceStub.callCount).to.equal(1);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 12`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `lemming622`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[11]).to.equal('lemming622');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(2);
            expect(setRaceStub.callCount).to.equal(2);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `web_mage`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[11]).to.equal('lemming622');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(2);
            expect(setRaceStub.callCount).to.equal(2);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 21`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `web_mage`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[11]).to.equal('lemming622');
            expect(context.activeRace.guesses[20]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(3);
            expect(setRaceStub.callCount).to.equal(3);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 5`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `aestolia`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[4]).to.equal('aestolia');
            expect(context.activeRace.guesses[11]).to.equal('lemming622');
            expect(context.activeRace.guesses[20]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(4);
            expect(setRaceStub.callCount).to.equal(4);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 15`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `digidude22`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[4]).to.equal('aestolia');
            expect(context.activeRace.guesses[11]).to.equal('lemming622');
            expect(context.activeRace.guesses[14]).to.equal('digidude22');
            expect(context.activeRace.guesses[20]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(5);
            expect(setRaceStub.callCount).to.equal(5);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 21`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `TheShadesAT`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[4]).to.equal('aestolia');
            expect(context.activeRace.guesses[11]).to.equal('lemming622');
            expect(context.activeRace.guesses[14]).to.equal('digidude22');
            expect(context.activeRace.guesses[20]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(6);
            expect(setRaceStub.callCount).to.equal(5);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 2`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `TheShadesAT`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[1]).to.equal('TheShadesAT');
            expect(context.activeRace.guesses[4]).to.equal('aestolia');
            expect(context.activeRace.guesses[11]).to.equal('lemming622');
            expect(context.activeRace.guesses[14]).to.equal('digidude22');
            expect(context.activeRace.guesses[20]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(7);
            expect(setRaceStub.callCount).to.equal(6);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 9`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `ZephyrBlayze`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[1]).to.equal('TheShadesAT');
            expect(context.activeRace.guesses[4]).to.equal('aestolia');
            expect(context.activeRace.guesses[8]).to.equal('ZephyrBlayze');
            expect(context.activeRace.guesses[11]).to.equal('lemming622');
            expect(context.activeRace.guesses[14]).to.equal('digidude22');
            expect(context.activeRace.guesses[20]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(8);
            expect(setRaceStub.callCount).to.equal(7);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 18`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `ZephyrBlayze`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[1]).to.equal('TheShadesAT');
            expect(context.activeRace.guesses[4]).to.equal('aestolia');
            expect(context.activeRace.guesses[8]).to.equal('ZephyrBlayze');
            expect(context.activeRace.guesses[11]).to.equal('lemming622');
            expect(context.activeRace.guesses[14]).to.equal('digidude22');
            expect(context.activeRace.guesses[20]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(9);
            expect(setRaceStub.callCount).to.equal(7);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;
        });

        it('verify that gtguess cannot be called after gtstop is called', async () => {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: true,
                    invitational: false,
                    startedAt: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000,
                    restream: '#jexreffy',
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
                message: `!gtstart`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `oddwalls`
            }

            expect(gtStartCommand.isCommandValid(context)).to.be.true;
            gtStartCommand.executeCommand(context);

            expect(context.activeRace.guessGameStarted).to.be.true;
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 14`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `lemming622`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(2);
            expect(setRaceStub.callCount).to.equal(2);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 20`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `web_mage`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(context.activeRace.guesses[19]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(3);
            expect(setRaceStub.callCount).to.equal(3);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 6`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `aestolia`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[5]).to.equal('aestolia');
            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(context.activeRace.guesses[19]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(4);
            expect(setRaceStub.callCount).to.equal(4);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 10`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `digidude22`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[5]).to.equal('aestolia');
            expect(context.activeRace.guesses[9]).to.equal('digidude22');
            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(context.activeRace.guesses[19]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(5);
            expect(setRaceStub.callCount).to.equal(5);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 3`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `TheShadesAT`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[2]).to.equal('TheShadesAT');
            expect(context.activeRace.guesses[5]).to.equal('aestolia');
            expect(context.activeRace.guesses[9]).to.equal('digidude22');
            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(context.activeRace.guesses[19]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(6);
            expect(setRaceStub.callCount).to.equal(6);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtstop`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `oddwalls`;

            expect(gtStopCommand.isCommandValid(context)).to.be.true;
            gtStopCommand.executeCommand(context);

            expect(context.activeRace.guesses[2]).to.equal('TheShadesAT');
            expect(context.activeRace.guesses[5]).to.equal('aestolia');
            expect(context.activeRace.guesses[9]).to.equal('digidude22');
            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(context.activeRace.guesses[19]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(7);
            expect(setRaceStub.callCount).to.equal(7);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 8`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `ZephyrBlayze`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.false;
        });

        it('verify that gtbk works correctly', async () => {
            let sendDiscordStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves();
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let winnerStub = sinon.stub(mockApp.routines, 'gtbkWinner');

            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: true,
                    invitational: false,
                    startedAt: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000,
                    restream: '#jexreffy',
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
                message: `!gtstart`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `oddwalls`
            }

            expect(gtStartCommand.isCommandValid(context)).to.be.true;
            gtStartCommand.executeCommand(context);

            expect(context.activeRace.guessGameStarted).to.be.true;
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 14`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `lemming622`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(2);
            expect(setRaceStub.callCount).to.equal(2);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 20`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `web_mage`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(context.activeRace.guesses[19]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(3);
            expect(setRaceStub.callCount).to.equal(3);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 6`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `aestolia`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[5]).to.equal('aestolia');
            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(context.activeRace.guesses[19]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(4);
            expect(setRaceStub.callCount).to.equal(4);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 10`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `digidude22`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[5]).to.equal('aestolia');
            expect(context.activeRace.guesses[9]).to.equal('digidude22');
            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(context.activeRace.guesses[19]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(5);
            expect(setRaceStub.callCount).to.equal(5);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 3`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `TheShadesAT`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[2]).to.equal('TheShadesAT');
            expect(context.activeRace.guesses[5]).to.equal('aestolia');
            expect(context.activeRace.guesses[9]).to.equal('digidude22');
            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(context.activeRace.guesses[19]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(6);
            expect(setRaceStub.callCount).to.equal(6);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtguess 8`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `ZephyrBlayze`;

            expect(gtGuessCommand.isCommandValid(context)).to.be.true;
            gtGuessCommand.executeCommand(context);

            expect(context.activeRace.guesses[2]).to.equal('TheShadesAT');
            expect(context.activeRace.guesses[5]).to.equal('aestolia');
            expect(context.activeRace.guesses[7]).to.equal('ZephyrBlayze');
            expect(context.activeRace.guesses[9]).to.equal('digidude22');
            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(context.activeRace.guesses[19]).to.equal('web_mage');
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(7);
            expect(setRaceStub.callCount).to.equal(7);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtstop`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `oddwalls`;

            expect(gtStopCommand.isCommandValid(context)).to.be.true;
            gtStopCommand.executeCommand(context);

            expect(context.activeRace.guesses[2]).to.equal('TheShadesAT');
            expect(context.activeRace.guesses[5]).to.equal('aestolia');
            expect(context.activeRace.guesses[7]).to.equal('ZephyrBlayze');
            expect(context.activeRace.guesses[9]).to.equal('digidude22');
            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(context.activeRace.guesses[19]).to.equal('web_mage');
            expect(context.activeRace.gtRunner).to.be.null;
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(8);
            expect(setRaceStub.callCount).to.equal(8);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.notCalled).to.be.true;

            await mockApp.sleep(1);

            context.message =`!gtbk 22`;
            context.messageChannel = '#jexreffy';
            context.origination = mockApp.TWITCH;
            context.username = `oddwalls`;

            expect(gtbkCommand.isCommandValid(context)).to.be.true;
            gtbkCommand.executeCommand(context);

            expect(context.activeRace.guesses[2]).to.equal('TheShadesAT');
            expect(context.activeRace.guesses[5]).to.equal('aestolia');
            expect(context.activeRace.guesses[7]).to.equal('ZephyrBlayze');
            expect(context.activeRace.guesses[9]).to.equal('digidude22');
            expect(context.activeRace.guesses[13]).to.equal('lemming622');
            expect(context.activeRace.guesses[19]).to.equal('web_mage');
            expect(context.activeRace.gtRunner).to.equal('TheCrystalCompany');
            expect(context.activeRace.gtbk).to.equal(22);
            expect(sendDiscordStub.notCalled).to.be.true;
            expect(sendTwitchStub.callCount).to.equal(8);
            expect(setRaceStub.callCount).to.equal(9);
            expect(broadcastStub.notCalled).to.be.true;
            expect(winnerStub.calledOnce).to.be.true;
        });
    });
});