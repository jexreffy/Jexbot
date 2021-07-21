'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command blueballs', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    const CommandBlueballs = require('../../commands/blueballs');
    let blueballsCommand = new CommandBlueballs(mockApp);

    beforeEach(function () {
        mockApp.sendToTwitchChannel = function(guildId, channel, message) { };
        mockApp.db = {
            setRaceData: function (guildId, race) { }
        };
    });

    context('verify blueballs command', function () {
        it('verify command has correct name', function (done) {
            expect(blueballsCommand.commandName).to.equal('blueballs');
            done();
        });

        it('verify command is race command', function (done) {
            expect(blueballsCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify blueballs cannot be executed unless it originates from Twitch', function (done) {
            let context = {
                activeRace: {
                    blueballs: -1
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!blueballs 4`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(blueballsCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.TWITCH;

            expect(blueballsCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify blueballs cannot be executed if blueballs has already been called', function (done) {
            let context = {
                activeRace: {
                    blueballs: -1
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!blueballs 4`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(blueballsCommand.isCommandValid(context)).to.be.true;

            context.activeRace.blueballs = 2;

            expect(blueballsCommand.isCommandValid(context)).to.be.false;

            done();
        });

        it('verify blueballs cannot be executed if a number is not provided with the command', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');

            let context = {
                activeRace: {
                    blueballs: -1
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!blueballs`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(blueballsCommand.isCommandValid(context)).to.be.true;

            blueballsCommand.executeCommand(context);

            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;

            done();
        });

        it('verify blueballs cannot be executed if a number outside of [0, 15] is provided', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');

            let context = {
                activeRace: {
                    blueballs: -1
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!blueballs -1`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(blueballsCommand.isCommandValid(context)).to.be.true;

            blueballsCommand.executeCommand(context);

            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;

            context.message = `!blueballs 16`;

            blueballsCommand.executeCommand(context);

            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;

            context.message = `!blueballs 87`;

            blueballsCommand.executeCommand(context);

            expect(sendTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;

            done();
        });

        it('verify blueballs can be executed if a number inside of [0, 15] is provided', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');

            let context = {
                activeRace: {
                    blueballs: -1
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!blueballs 1`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(blueballsCommand.isCommandValid(context)).to.be.true;

            blueballsCommand.executeCommand(context);

            expect(context.activeRace.blueballs).to.equal(1);
            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(sendTwitchStub.calledWith(context.guildId, context.messageChannel, `Aga 1 Blue Balls recorded as 1`)).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;

            done();
        });
    });
});