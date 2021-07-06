'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');
const getRandom = require('../../common/getRandom');
const resetRace = require('../../common/resetRace');
const setRaceCategory = require('../../common/setRaceCategory');

describe('new', function() {
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
        mockApp.db = {
            getCategories: function () { },
            getCategory: function(category) { },
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
            expect(newCommand.isRaceCommand).to.equal(true);
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
                username: `jexreffy`
            }

            expect(newCommand.isCommandValid(context)).to.equal(false);

            context.origination = mockApp.DISCORD;

            expect(newCommand.isCommandValid(context)).to.equal(true);

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
                username: `jexreffy`
            }

            expect(newCommand.isCommandValid(context)).to.equal(false);

            context.activeRace.finished = true;

            expect(newCommand.isCommandValid(context)).to.equal(true);

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
                username: `TheLostCarol`
            }

            expect(newCommand.isCommandValid(context)).to.equal(false);

            context.username = 'jexreffy'

            expect(newCommand.isCommandValid(context)).to.equal(true);

            done();
        });

        it('verify new race with no category is initiated correctly', async () => {
            let category = require(`../../categories/standard.json`);

            let sendStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves({ id: 1 });
            let categoriesStub = sinon.stub(mockApp.db, 'getCategories').returns([ 'standard' ]);
            let categoryStub = sinon.stub(mockApp.db, 'getCategory').returns(category);
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateEmbedStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    finished: true
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.new`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(newCommand.isCommandValid(context)).to.equal(true);

            newCommand.executeCommand(context);

            await mockApp.sleep(1);

            expect(context.activeRace.ladder).to.equal(false);
            expect(context.activeRace.invitational).to.equal(false);
            expect(context.activeRace.locked).to.equal(false);
            expect(context.activeRace.teams).to.equal(false);
            expect(context.activeRace.relay).to.equal(false);
            expect(context.activeRace.started).to.equal(false);
            expect(context.activeRace.pingIndex).is.greaterThanOrEqual(0).and.lessThan(mockApp.config['pings'].length);
            expect(context.activeRace.countdownIndex).is.greaterThanOrEqual(0).and.lessThan(mockApp.config['countdowns'].length);
            expect(context.activeRace.mutlistream).to.equal('https://multistre.am/');
            expect(context.activeRace.status).to.equal('PRE-RACE: WAITING FOR PLAYERS TO JOIN');
            expect(context.activeRace.categoryToRoll).to.equal('standard');
            expect(context.activeRace.category).to.equal(category.category);
            expect(context.activeRace.categoryName).to.equal(category.name);
            expect(context.activeRace.categoryDescription).to.equal(category.description);
            expect(context.activeRace.guessGameEnabled).to.equal(category.gtbk);

            expect(sendStub.calledTwice).to.be.true;
            expect(sendStub.calledWith(context.guildId, `ping${context.guildId} ${mockApp.config['pings'][context.activeRace.pingIndex]}`)).to.be.true;
            expect(categoriesStub.calledOnce).to.be.true;
            expect(categoryStub.calledOnce).to.be.true;
            expect(categoryStub.calledWith('standard')).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateEmbedStub.calledOnce).to.be.true;
        });
    });
});