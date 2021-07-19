'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');
const resetRace = require('../../common/resetRace');
const setRaceCategory = require('../../common/setRaceCategory');

describe('setRaceCategory', function() {
    let mockApp = {
        config: config,
        db: { },
        routines: {
            'resetRace': resetRace
        }
    };

    beforeEach(function () {
       mockApp.db = {
           getCategories: function () { },
           getCategory: function(category) { },
           getSotwSeed: function(guildId, category) { }
       };
    });

    context('verify categories get selected properly for rolling', function () {
        it('verify no category yields default category', function (done) {
            let categoryKey = mockApp.config['defaultCategory'];
            let standardCategory = require(`../../categories/alttpr/standard.json`);
            let categoriesStub = sinon.stub(mockApp.db, 'getCategories').returns([ 'standard' ]);
            let categoryStub = sinon.stub(mockApp.db, 'getCategory').returns(standardCategory);

            let context = {
                guildId: mockApp.config['botOwnerGuild'],
                activeRace: {}
            };

            mockApp.routines['resetRace'](context.activeRace);
            setRaceCategory(mockApp, context, '');

            expect(categoriesStub.calledOnce).to.be.true;
            expect(categoryStub.calledOnce).to.be.true;
            expect(categoryStub.calledWith(categoryKey)).to.be.true;
            expect(context.activeRace.categoryToRoll).to.equal(categoryKey);
            expect(context.activeRace.category).to.equal(standardCategory.category);
            expect(context.activeRace.categoryName).to.equal(standardCategory.name);
            expect(context.activeRace.categoryDescription).to.equal(standardCategory.description);
            expect(context.activeRace.guessGameEnabled).to.equal(standardCategory.gtbk);
            done();
        });

        it('verify open category yields correct results', function (done) {
            let categoryKey = 'open';
            let category = require(`../../categories/alttpr/${categoryKey}.json`);
            let categoriesStub = sinon.stub(mockApp.db, 'getCategories').returns([ categoryKey ]);
            let categoryStub = sinon.stub(mockApp.db, 'getCategory').withArgs(categoryKey).returns(category);

            let context = {
                guildId: mockApp.config['botOwnerGuild'],
                activeRace: {}
            };

            mockApp.routines['resetRace'](context.activeRace);
            setRaceCategory(mockApp, context, 'open');

            expect(categoriesStub.calledOnce).to.be.true;
            expect(categoryStub.calledOnce).to.be.true;
            expect(categoryStub.calledWith(categoryKey)).to.be.true;
            expect(context.activeRace.categoryToRoll).to.equal(categoryKey);
            expect(context.activeRace.category).to.equal(category.category);
            expect(context.activeRace.categoryName).to.equal(category.name);
            expect(context.activeRace.categoryDescription).to.equal(category.description);
            expect(context.activeRace.guessGameEnabled).to.equal(category.gtbk);
            done();
        });

        it('verify crosskeys category yields correct results', function (done) {
            let categoryKey = 'crosskeys';
            let category = require(`../../categories/alttpr/${categoryKey}.json`);
            let categoriesStub = sinon.stub(mockApp.db, 'getCategories').returns([ categoryKey ]);
            let categoryStub = sinon.stub(mockApp.db, 'getCategory').withArgs(categoryKey).returns(category);

            let context = {
                guildId: mockApp.config['botOwnerGuild'],
                activeRace: {}
            };

            mockApp.routines['resetRace'](context.activeRace);
            setRaceCategory(mockApp, context, 'crosskeys');

            expect(categoriesStub.calledOnce).to.be.true;
            expect(categoryStub.calledOnce).to.be.true;
            expect(categoryStub.calledWith(categoryKey)).to.be.true;
            expect(context.activeRace.categoryToRoll).to.equal(categoryKey);
            expect(context.activeRace.category).to.equal(category.category);
            expect(context.activeRace.categoryName).to.equal(category.name);
            expect(context.activeRace.categoryDescription).to.equal(category.description);
            expect(context.activeRace.guessGameEnabled).to.equal(category.gtbk);
            done();
        });

        it('verify Seed of the Week Easy category yields correct results', function (done) {
            let categoryKey = 'casualboots';
            let category = require(`../../categories/alttpr/${categoryKey}.json`);
            let categoryItems =  {
                category: "casualboots",
                name: "Casual Boots",
                link: "<https://alttpr.com/h/bYMNq4W4G0>",
                code: "<:Bottle:812714328280006676> <:Bombos:812714328079073341> <:Shovel:812714328317755402> <:Flippers:812714328251695105> <:MCHammer:812714328292720662>"
            };
            let categoriesStub = sinon.stub(mockApp.db, 'getCategories').returns([ categoryKey ]);
            let categoryStub = sinon.stub(mockApp.db, 'getCategory').withArgs(categoryKey).returns(category);
            let sotwStub = sinon.stub(mockApp.db, 'getSotwSeed').withArgs(mockApp.config['botOwnerGuild'], 'sotweasy').returns(categoryItems);

            let context = {
                guildId: mockApp.config['botOwnerGuild'],
                activeRace: {}
            };

            mockApp.routines['resetRace'](context.activeRace);
            setRaceCategory(mockApp, context, 'sotweasy');

            expect(categoriesStub.notCalled).to.be.true;
            expect(categoryStub.calledOnce).to.be.true;
            expect(categoryStub.calledWith(categoryKey)).to.be.true;
            expect(sotwStub.calledOnce).to.be.true;
            expect(sotwStub.calledWith(context.guildId, 'sotweasy')).to.be.true;
            expect(context.activeRace.categoryToRoll).to.be.undefined;
            expect(context.activeRace.category).to.equal(category.category);
            expect(context.activeRace.categoryName).to.equal(category.name);
            expect(context.activeRace.categoryDescription).to.equal(category.description);
            expect(context.activeRace.seedLink).to.equal(categoryItems.link);
            expect(context.activeRace.seedCode).to.equal(categoryItems.code);
            expect(context.activeRace.guessGameEnabled).to.equal(category.gtbk);
            expect(context.activeRace.seedRoller).to.equal('JexBot');
            done();
        });

        it('verify Seed of the Week Medium category yields correct results', function (done) {
            let categoryKey = 'randomcrystals';
            let category = require(`../../categories/alttpr/${categoryKey}.json`);
            let categoryItems = {
                category: "randomcrystals",
                name: "Random Crystals",
                link: "<https://alttpr.com/h/g5yoK1nAym>",
                code: "<:Flippers:812714328251695105> <:Powder:812714328310284319> <:Mudora:812714328230854696> <:Boomerang:812714328222335067> <:Bow:812714327928078367>"
            };
            let categoriesStub = sinon.stub(mockApp.db, 'getCategories').returns([ categoryKey ]);
            let categoryStub = sinon.stub(mockApp.db, 'getCategory').withArgs(categoryKey).returns(category);
            let sotwStub = sinon.stub(mockApp.db, 'getSotwSeed').withArgs(mockApp.config['botOwnerGuild'], 'sotwmedium').returns(categoryItems);

            let context = {
                guildId: mockApp.config['botOwnerGuild'],
                activeRace: {}
            };

            mockApp.routines['resetRace'](context.activeRace);
            setRaceCategory(mockApp, context, 'sotwmedium');

            expect(categoriesStub.notCalled).to.be.true;
            expect(categoryStub.calledOnce).to.be.true;
            expect(categoryStub.calledWith(categoryKey)).to.be.true;
            expect(sotwStub.calledOnce).to.be.true;
            expect(sotwStub.calledWith(context.guildId, 'sotwmedium')).to.be.true;
            expect(context.activeRace.categoryToRoll).to.be.undefined;
            expect(context.activeRace.category).to.equal(category.category);
            expect(context.activeRace.categoryName).to.equal(category.name);
            expect(context.activeRace.categoryDescription).to.equal(category.description);
            expect(context.activeRace.seedLink).to.equal(categoryItems.link);
            expect(context.activeRace.seedCode).to.equal(categoryItems.code);
            expect(context.activeRace.guessGameEnabled).to.equal(category.gtbk);
            expect(context.activeRace.seedRoller).to.equal('JexBot');
            done();
        });

        it('verify Seed of the Week Hard category yields correct results', function (done) {
            let categoryKey = 'mysteryladder';
            let category = require(`../../categories/alttpr/${categoryKey}.json`);
            let categoryItems = {
                category: "mysteryladder",
                name: "Mystery Ladder",
                link: "<https://alttpr.com/h/KJG3l83zM3>",
                code: "<:Flippers:812714328251695105> <:Mushroom:812714328317755462> <:Mudora:812714328230854696> <:Mushroom:812714328317755462> <:ALotOfLove:817783033712476200>"
            };
            let categoriesStub = sinon.stub(mockApp.db, 'getCategories').returns([ categoryKey ]);
            let categoryStub = sinon.stub(mockApp.db, 'getCategory').withArgs(categoryKey).returns(category);
            let sotwStub = sinon.stub(mockApp.db, 'getSotwSeed').withArgs(mockApp.config['botOwnerGuild'], 'sotwhard').returns(categoryItems);

            let context = {
                guildId: mockApp.config['botOwnerGuild'],
                activeRace: {}
            };

            mockApp.routines['resetRace'](context.activeRace);
            setRaceCategory(mockApp, context, 'sotwhard');

            expect(categoriesStub.notCalled).to.be.true;
            expect(categoryStub.calledOnce).to.be.true;
            expect(categoryStub.calledWith(categoryKey)).to.be.true;
            expect(sotwStub.calledOnce).to.be.true;
            expect(sotwStub.calledWith(context.guildId, 'sotwhard')).to.be.true;
            expect(context.activeRace.categoryToRoll).to.be.undefined;
            expect(context.activeRace.category).to.equal(category.category);
            expect(context.activeRace.categoryName).to.equal(category.name);
            expect(context.activeRace.categoryDescription).to.equal(category.description);
            expect(context.activeRace.seedLink).to.equal(categoryItems.link);
            expect(context.activeRace.seedCode).to.equal(categoryItems.code);
            expect(context.activeRace.guessGameEnabled).to.equal(category.gtbk);
            expect(context.activeRace.seedRoller).to.equal('JexBot');
            done();
        });
    });
});