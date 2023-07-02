'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command lock', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: { }
    };

    const CommandLock = require('../../commands/lock');
    let lockCommand = new CommandLock(mockApp);

    beforeEach(function () {
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines.updateRaceMessage = function(app, context) { };
    });

    context('verify lock command', function () {
        it('verify command has correct name', function (done) {
            expect(lockCommand.commandName).to.equal('lock');
            done();
        });

        it('verify command is race command', function (done) {
            expect(lockCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify lock cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    locked: false,
                    status: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.lock`,
                messageChannel: null,
                origination: mockApp.TWITCH,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(lockCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.DISCORD;

            expect(lockCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify lock cannot be executed after the race has started', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    locked: false,
                    status: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.lock`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(lockCommand.isCommandValid(context)).to.be.true;

            context.activeRace.started = true;

            expect(lockCommand.isCommandValid(context)).to.be.false;

            done();
        });

        it('verify lock cannot be executed unless a referee triggers it', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    locked: false,
                    status: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.lock`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `TheLostCarol`,
                displayName: `TheLostCarol`
            }

            expect(lockCommand.isCommandValid(context)).to.be.false;

            context.username = 'jexreffy';
            context.displayName = 'jexreffy';

            expect(lockCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify lock executes correctly', async () => {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateEmbedStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    locked: false,
                    status: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.lock`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(lockCommand.isCommandValid(context)).to.be.true;

            lockCommand.executeCommand(context);

            expect(context.activeRace.locked).to.be.true;
            expect(context.activeRace.status).to.equal('SIGNUPS CLOSED: WAITING FOR PLAYERS TO READY UP');

            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateEmbedStub.calledOnce).to.be.true;
        });
    });
});