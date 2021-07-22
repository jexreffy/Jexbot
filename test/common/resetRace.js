'use strict'
const expect = require('chai').expect;
const resetRace = require('../../common/resetRace');

describe('resetRace', function() {
    context('reset race object for a new object', function () {
        it('correct keys set', function () {
            let race = {}
            resetRace(race);
            let keys = Object.keys(race);
            expect(keys.length).to.equal(43);
        });

        it('correct values set', function () {
            let race = {}
            resetRace(race);
            expect(race.ladder).to.be.false;
            expect(race.invitational).to.be.false;
            expect(race.teams).to.be.false;
            expect(race.multiworld).to.be.false;
            expect(race.locked).to.be.false;
            expect(race.relay).to.be.false;
            expect(race.connected).to.be.false;
            expect(race.started).to.be.false;
            expect(race.finished).to.be.false;
            expect(race.startedAt).to.equal(null);
            expect(race.initiatedAt).to.equal(Date.now());
            expect(race.escapeItem).to.equal(null);
            expect(race.lastHello).to.equal(null);
            expect(race.pingIndex).to.equal(-1);
            expect(race.countdownIndex).to.equal(-1);
            expect(race.remainingPlayers).to.equal(0);
            expect(race.players).has.a.lengthOf(0);
            expect(race.crew).has.a.lengthOf(0);
            expect(race.lastCallback).to.equal(null);
            expect(race.blueballs).to.equal(-1);
            expect(race.guessGameEnabled).to.be.false;
            expect(race.guessGameStarted).to.be.false;
            expect(race.guessGameFinished).to.be.false;
            expect(race.gtRunner).to.equal(null);
            expect(race.gtbk).to.equal(-1);
            expect(race.gtbkWinner).to.equal(null);
            expect(race.spoilersAllowed).to.be.false;
            expect(race.gtbkGuess).to.equal(-1);
            expect(race.gatekeeper).to.equal(null);
            expect(race.category).to.equal('');
            expect(race.categoryName).to.equal('');
            expect(race.categoryDescription).to.equal('');
            expect(race.messageId).to.equal(null);
            expect(race.seedCode).to.equal(null);
            expect(race.seedLink).to.equal(null);
            expect(race.seedRoller).to.equal(null);
            expect(race.multistream).to.equal('');
            expect(race.restream).to.equal(null);
            expect(race.status).to.equal('');
            expect(race.lastDickTime).to.equal(null);
            expect(race.dickCount).to.equal(0);
            expect(race.legs).has.a.lengthOf(0);
            expect(race.legStartTime).has.a.lengthOf(0);
            expect(race.guesses).has.a.lengthOf(22);
            for (let i = 0; i < race.guesses; i++) {
                expect(race.guesses[i]).to.equal(null);
            }
        });
    });
});