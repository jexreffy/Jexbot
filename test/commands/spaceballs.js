'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command spaceballs', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    const CommandSpaceballs = require('../../commands/spaceballs');
    let spaceballsCommand = new CommandSpaceballs(mockApp);

    beforeEach(function () {
        mockApp.db = {
            getSpaceballs: function () { },
            setSpaceballs: function (time) { }
        };
        mockApp.routines = {
            broadcastMessage: function (app, context, message, bold) { },
            updateRaceMessage: function (app, context) { }
        };
    });

    context('verify spaceballs command', function () {
        it('verify command has correct name', function (done) {
            expect(spaceballsCommand.commandName).to.equal('spaceballs');
            done();
        });

        it('verify command is race command', function (done) {
            expect(spaceballsCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify spaceballs can be executed from Discord and Twitch', function (done) {
            let getSpaceballsStub = sinon.stub(mockApp.db, 'getSpaceballs').returns(0);
            let setSpaceballsStub = sinon.stub(mockApp.db, 'setSpaceballs');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    ladder: false,
                    initiatedAt: 160000000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!spaceballs`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(spaceballsCommand.isCommandValid(context)).to.be.true;

            expect(getSpaceballsStub.calledOnce).to.be.true;
            expect(setSpaceballsStub.notCalled).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;
            expect(updateStub.notCalled).to.be.true;

            context.origination = mockApp.TWITCH;

            expect(spaceballsCommand.isCommandValid(context)).to.be.true;

            expect(getSpaceballsStub.calledTwice).to.be.true;
            expect(setSpaceballsStub.notCalled).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;
            expect(updateStub.notCalled).to.be.true;

            done();
        });

        it('verify spaceballs cannot be called if it is not outside the minimum new callback window', function (done) {
            let getSpaceballsStub = sinon.stub(mockApp.db, 'getSpaceballs').returns(Date.now() - mockApp.config['minimumNewSpaceballsSeconds'] * 1000 + 1000);
            let setSpaceballsStub = sinon.stub(mockApp.db, 'setSpaceballs');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    ladder: false,
                    initiatedAt: 16000000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!spaceballs`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(spaceballsCommand.isCommandValid(context)).to.be.false;

            expect(getSpaceballsStub.calledOnce).to.be.true;
            expect(setSpaceballsStub.notCalled).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;
            expect(updateStub.notCalled).to.be.true;

            getSpaceballsStub = getSpaceballsStub.returns(Date.now() - mockApp.config['minimumNewSpaceballsSeconds'] * 1000 - 1000);

            expect(spaceballsCommand.isCommandValid(context)).to.be.true;

            expect(getSpaceballsStub.calledTwice).to.be.true;
            expect(setSpaceballsStub.notCalled).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;
            expect(updateStub.notCalled).to.be.true;

            done();
        });

        it('verify spaceballs executes correctly', async () => {
            let getSpaceballsStub = sinon.stub(mockApp.db, 'getSpaceballs').returns(0);
            let setSpaceballsStub = sinon.stub(mockApp.db, 'setSpaceballs');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    ladder: false,
                    initiatedAt: 16000000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!spaceballs`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(spaceballsCommand.isCommandValid(context)).to.be.true;

            spaceballsCommand.executeCommand(context);

            expect(getSpaceballsStub.calledOnce).to.be.true;
            expect(setSpaceballsStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;
            expect(broadcastStub.calledWith(mockApp, context, mockApp.config['spaceballsClock'], true));
        });

        it('verify spaceballs executes correctly for a ladder race', async () => {
            let getSpaceballsStub = sinon.stub(mockApp.db, 'getSpaceballs').returns(0);
            let setSpaceballsStub = sinon.stub(mockApp.db, 'setSpaceballs');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    ladder: true,
                    initiatedAt: 16000000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!spaceballs`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(spaceballsCommand.isCommandValid(context)).to.be.true;

            spaceballsCommand.executeCommand(context);

            expect(getSpaceballsStub.calledOnce).to.be.true;
            expect(setSpaceballsStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(updateStub.notCalled).to.be.true;
            expect(broadcastStub.calledWith(mockApp, context, mockApp.config['spaceballsClock'], true));
        });

        it('verify spaceballs executes correctly before a race starts', async () => {
            let getSpaceballsStub = sinon.stub(mockApp.db, 'getSpaceballs').returns(0);
            let setSpaceballsStub = sinon.stub(mockApp.db, 'setSpaceballs');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    ladder: true,
                    initiatedAt: null
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!spaceballs`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(spaceballsCommand.isCommandValid(context)).to.be.true;

            spaceballsCommand.executeCommand(context);

            expect(getSpaceballsStub.calledOnce).to.be.true;
            expect(setSpaceballsStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(updateStub.notCalled).to.be.true;
            expect(broadcastStub.calledWith(mockApp, context, mockApp.config['spaceballsClock'], true));
        });
    });
});