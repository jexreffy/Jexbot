'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');
const getRandom = require('../../routines/getRandom');
const resetRace = require('../../routines/resetRace');
const setRaceCategory = require('../../routines/setRaceCategory');

describe('command new', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: {
            'getRandom': getRandom,
            'resetRace': resetRace,
            'setRaceCategory': setRaceCategory
        },
        getPingRole: function(guildId) {
            return `ping${guildId}`;
        },
        sleep: function(m) {
            return new Promise((resolve, reject) => setTimeout(resolve, m));
        }
    };

    const CommandNew = require('../../commands/new');
    let newCommand = new CommandNew(mockApp);

    beforeEach(function () {
        mockApp.sendToDiscordRaceChannel = function(guildId, message) { };
        mockApp.sendEmbedToDiscordRaceChannel = function(guildId, message) { };
        mockApp.db = {
            getCategories: function (game) { },
            getCategory: function(game, category) { },
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines.updateRaceMessage = function(app, context) { };
    });

    context('verify new command', function () {
        it('verify command has correct name', function (done) {
            expect(newCommand.commandName).to.equal('new');
            done();
        });

        it('verify command is race command', function (done) {
            expect(newCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify new race cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.new`,
                messageChannel: null,
                origination: mockApp.TWITCH,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(newCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.DISCORD;

            expect(newCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify new race cannot be executed unless the previous race is finished', function (done) {
            let context = {
                activeRace: {
                    finished: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.new`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(newCommand.isCommandValid(context)).to.be.false;

            context.activeRace.finished = true;

            expect(newCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify new race cannot be executed unless a referee triggers it', function (done) {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.new`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `TheLostCarol`,
                displayName: `TheLostCarol`
            }

            expect(newCommand.isCommandValid(context)).to.be.false;

            context.username = 'jexreffy';
            context.displayName = 'jexreffy';

            expect(newCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify new race with no category is initiated correctly', async () => {
            let category = require(`../../categories/alttpr/standard.json`);

            let sendStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves({ id: 1 });
            let sendEmbedStub = sinon.stub(mockApp, 'sendEmbedToDiscordRaceChannel').resolves({ id: 2 });
            let categoriesStub = sinon.stub(mockApp.db, 'getCategories').returns([ 'standard' ]);
            let categoryStub = sinon.stub(mockApp.db, 'getCategory').returns(category);
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateEmbedStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    finished: true
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.new alttpr`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                userId: `0`,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(newCommand.isCommandValid(context)).to.be.true;

            newCommand.executeCommand(context);

            await mockApp.sleep(1);

            expect(context.activeRace.ladder).to.be.false;
            expect(context.activeRace.invitational).to.be.false;
            expect(context.activeRace.locked).to.be.false;
            expect(context.activeRace.teams).to.be.false;
            expect(context.activeRace.relay).to.be.false;
            expect(context.activeRace.started).to.be.false;
            expect(context.activeRace.pingIndex).is.greaterThanOrEqual(0).and.lessThan(mockApp.config['pings'].length);
            expect(context.activeRace.countdownIndex).is.greaterThanOrEqual(0).and.lessThan(mockApp.config['countdowns'].length);
            expect(context.activeRace.status).to.equal('PRE-RACE: WAITING FOR PLAYERS TO JOIN');
            expect(context.activeRace.game).to.equal('alttpr');
            expect(context.activeRace.categoryToRoll).to.equal('standard');
            expect(context.activeRace.category).to.equal(category.category);
            expect(context.activeRace.categoryName).to.equal(category.name);
            expect(context.activeRace.categoryDescription).to.equal(category.description);
            expect(context.activeRace.guessGameEnabled).to.equal(category.gtbk);

            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, `ping${context.guildId} ${mockApp.config['pings'][context.activeRace.pingIndex]}`)).to.be.true;
            expect(sendEmbedStub.calledOnce).to.be.true;
            expect(categoriesStub.calledOnce).to.be.true;
            expect(categoryStub.calledOnce).to.be.true;
            expect(categoryStub.calledWith('alttpr', 'standard')).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateEmbedStub.calledOnce).to.be.true;
        });
    });
});