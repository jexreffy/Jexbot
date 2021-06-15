'use strict'
const expect = require('chai').expect;
const setRaceCategory = require('../../common/setRaceCategory');

let App = require('../../mock/app');
let app = new App();

describe('setRaceCategory', function() {
    context('verify categories get selected properly for rolling', function () {
        it('verify no category yields default category', function (done) {
            let context = {
                activeRace: {}
            };

            app.routines['resetRace'](context.activeRace);
            setRaceCategory(app, context, '');

            let categoryKey = app.config['defaultCategory'];
            let category = app.db.getCategory(categoryKey);

            expect(context.activeRace.categoryToRoll).to.equal(categoryKey);
            expect(context.activeRace.category).to.equal(category.category);
            expect(context.activeRace.categoryName).to.equal(category.name);
            expect(context.activeRace.categoryDescription).to.equal(category.description);
            expect(context.activeRace.guessGameEnabled).to.equal(category.gtbk);
            done();
        });

        it('verify open category yields correct results', function (done) {
            let context = {
                activeRace: {}
            };

            app.routines['resetRace'](context.activeRace);
            setRaceCategory(app, context, 'open');

            let categoryKey = 'open';
            let category = app.db.getCategory(categoryKey);

            expect(context.activeRace.categoryToRoll).to.equal(categoryKey);
            expect(context.activeRace.category).to.equal(category.category);
            expect(context.activeRace.categoryName).to.equal(category.name);
            expect(context.activeRace.categoryDescription).to.equal(category.description);
            expect(context.activeRace.guessGameEnabled).to.equal(category.gtbk);
            done();
        });
    });

    after(function (done) {
        app.db.close();
        done();
    });
});