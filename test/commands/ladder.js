'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');
const resetRace = require('../../common/resetRace');
const setRaceCategory = require('../../common/setRaceCategory');

describe('command ladder', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: {
            'resetRace': resetRace,
            'setRaceCategory': setRaceCategory
        },
        sleep: function(m) {
            return new Promise((resolve, reject) => setTimeout(resolve, m));
        }
    };

    const CommandLadder = require('../../commands/ladder');
    let ladderCommand = new CommandLadder(mockApp);

    beforeEach(function () {
        mockApp.db = {
            getCategories: function () { },
            getCategory: function(category) { },
            setRaceData: function(guildId, race) { }
        };
    });

    context('verify ladder command', function () {
        it('verify command has correct name', function (done) {
            expect(ladderCommand.commandName).to.equal('ladder');
            done();
        });

        it('verify command is race command', function (done) {
            expect(ladderCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify ladder race cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.ladder`,
                messageChannel: null,
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(ladderCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.DISCORD;

            expect(ladderCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify ladder race cannot be executed unless the previous race is finished', function (done) {
            let context = {
                activeRace: {
                    finished: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.ladder`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(ladderCommand.isCommandValid(context)).to.be.false;

            context.activeRace.finished = true;

            expect(ladderCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify ladder race cannot be executed unless the bot owner triggers it', function (done) {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.ladder`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `TheLostCarol`
            }

            expect(ladderCommand.isCommandValid(context)).to.be.false;

            context.username = 'jexreffy'

            expect(ladderCommand.isCommandValid(context)).to.be.true;

            context.guildId = '8165160598710651651';

            expect(ladderCommand.isCommandValid(context)).to.be.false;

            done();
        });

        it('verify ladder race with no category is initiated correctly', async () => {
            let category = require(`../../categories/alttpr/standard.json`);

            let categoriesStub = sinon.stub(mockApp.db, 'getCategories').returns([ 'standard' ]);
            let categoryStub = sinon.stub(mockApp.db, 'getCategory').returns(category);
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');

            let context = {
                activeRace: {
                    finished: true
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.ladder`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(ladderCommand.isCommandValid(context)).to.be.true;

            ladderCommand.executeCommand(context);

            await mockApp.sleep(1);

            expect(context.activeRace.ladder).to.be.true;
            expect(context.activeRace.invitational).to.be.false;
            expect(context.activeRace.locked).to.be.false;
            expect(context.activeRace.teams).to.be.false;
            expect(context.activeRace.relay).to.be.false;
            expect(context.activeRace.started).to.be.true;
            expect(context.activeRace.startedAt).to.equal(context.activeRace.initiatedAt);
            expect(context.activeRace.categoryToRoll).to.equal('standard');
            expect(context.activeRace.category).to.equal(category.category);
            expect(context.activeRace.categoryName).to.equal(category.name);
            expect(context.activeRace.categoryDescription).to.equal(category.description);
            expect(context.activeRace.guessGameEnabled).to.equal(category.gtbk);
            expect(categoriesStub.calledOnce).to.be.true;
            expect(categoryStub.calledOnce).to.be.true;
            expect(categoryStub.calledWith('standard')).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
        });
    });
});