'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command close', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: { }
    };

    const CommandClose = require('../../commands/close');
    let closeCommand = new CommandClose(mockApp);

    beforeEach(function () {
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines.updateRaceMessage = function(app, context) { };
    });

    context('verify close command', function () {
        it('verify command has correct name', function (done) {
            expect(closeCommand.commandName).to.equal('close');
            done();
        });

        it('verify command is race command', function (done) {
            expect(closeCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify close cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    finished: false,
                    ladder: false,
                    status: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.close`,
                messageChannel: null,
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(closeCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.DISCORD;

            expect(closeCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify close cannot be executed unless a referee triggers it', function (done) {
            let context = {
                activeRace: {
                    finished: false,
                    ladder: false,
                    status: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.close`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `TheLostCarol`
            }

            expect(closeCommand.isCommandValid(context)).to.be.false;

            context.username = 'jexreffy'

            expect(closeCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify close executes correctly for a non-ladder race', async () => {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateEmbedStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    finished: false,
                    ladder: false,
                    status: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.close`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(closeCommand.isCommandValid(context)).to.be.true;

            closeCommand.executeCommand(context);

            expect(context.activeRace.finished).to.be.true;
            expect(context.activeRace.status).to.equal('RACE CLOSED');

            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateEmbedStub.calledOnce).to.be.true;
        });

        it('verify close executes correctly for a ladder race', async () => {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateEmbedStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    finished: false,
                    ladder: true,
                    status: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.close`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(closeCommand.isCommandValid(context)).to.be.true;

            closeCommand.executeCommand(context);

            expect(context.activeRace.finished).to.be.true;
            expect(context.activeRace.status).to.equal('RACE CLOSED');

            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateEmbedStub.notCalled).to.be.true;
        });
    });
});