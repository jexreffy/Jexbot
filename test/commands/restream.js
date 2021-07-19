'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command restream', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: { }
    };

    const CommandRestream = require('../../commands/restream');
    let restreamCommand = new CommandRestream(mockApp);

    beforeEach(function () {
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines.updateRaceMessage = function(app, context) { };
    });

    context('verify restream command', function () {
        it('verify command has correct name', function (done) {
            expect(restreamCommand.commandName).to.equal('restream');
            done();
        });

        it('verify command is race command', function (done) {
            expect(restreamCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify restream cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    restream: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.restream`,
                messageChannel: null,
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(restreamCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.DISCORD;

            expect(restreamCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify restream cannot be executed after the race has started', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    restream: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.restream`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(restreamCommand.isCommandValid(context)).to.be.true;

            context.activeRace.started = true;

            expect(restreamCommand.isCommandValid(context)).to.be.false;

            done();
        });

        it('verify restream cannot be executed unless a referee triggers it', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    restream: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.restream`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `TheLostCarol`
            }

            expect(restreamCommand.isCommandValid(context)).to.be.false;

            context.username = 'jexreffy'

            expect(restreamCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify restream executes correctly with no argument', async () => {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateEmbedStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    restream: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.restream`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(restreamCommand.isCommandValid(context)).to.be.true;

            restreamCommand.executeCommand(context);

            expect(context.activeRace.restream).to.be.null;

            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateEmbedStub.calledOnce).to.be.true;
        });

        it('verify restream executes correctly with on argument', async () => {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateEmbedStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    restream: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.restream on`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(restreamCommand.isCommandValid(context)).to.be.true;

            restreamCommand.executeCommand(context);

            expect(context.activeRace.restream).to.equal(mockApp.config['guilds'][context.guildId]['restreamChannel']);

            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateEmbedStub.calledOnce).to.be.true;
        });

        it('verify restream executes correctly with off argument', async () => {
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateEmbedStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    restream: ''
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.restream off`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(restreamCommand.isCommandValid(context)).to.be.true;

            restreamCommand.executeCommand(context);

            expect(context.activeRace.restream).to.be.null;

            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateEmbedStub.calledOnce).to.be.true;
        });
    });
});