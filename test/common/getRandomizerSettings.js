'use strict'
const expect = require('chai').expect;
const getRandomizerSettings = require('../../common/getRandomizerSettings');

describe('getRandomizerSettings', function() {
    context('verify default randomizer settings', function() {
        it('allows quickswap', function () {
            expect(getRandomizerSettings().allow_quickswap).to.be.true;
        });

        it('no glitches', function () {
            expect(getRandomizerSettings().glitches).to.equal('none');
        });

        it('advanced item placement', function () {
            expect(getRandomizerSettings().item_placement).to.equal('advanced');
        });

        it('standard dungeon item placement', function () {
            expect(getRandomizerSettings().dungeon_items).to.equal('standard');
        });

        it('items accessibility', function () {
            expect(getRandomizerSettings().accessibility).to.equal('items');
        });

        it('defeat ganon goal', function () {
            expect(getRandomizerSettings().goal).to.equal('ganon');
        });

        it('7 crystals GT', function () {
            expect(getRandomizerSettings().crystals.tower).to.equal('7');
        });

        it('7 crystals Ganon', function () {
            expect(getRandomizerSettings().crystals.ganon).to.equal('7');
        });

        it('standard mode', function () {
            expect(getRandomizerSettings().mode).to.equal('standard');
        });

        it('no entrance shuffle', function () {
            expect(getRandomizerSettings().entrances).to.equal('none');
        });

        it('hints off', function () {
            expect(getRandomizerSettings().hints).to.equal('off');
        });

        it('randomized swords', function () {
            expect(getRandomizerSettings().weapons).to.equal('randomized');
        });

        it('normal item pool', function () {
            expect(getRandomizerSettings().item.pool).to.equal('normal');
        });

        it('normal item functionality', function () {
            expect(getRandomizerSettings().item.functionality).to.equal('normal');
        });

        it('race seed', function () {
            expect(getRandomizerSettings().tournament).to.be.true;
        });

        it('spoilers off', function () {
            expect(getRandomizerSettings().spoilers).to.equal('off');
        });

        it('english language', function () {
            expect(getRandomizerSettings().lang).to.equal('en');
        });

        it('boss shuffle off', function () {
            expect(getRandomizerSettings().enemizer.boss_shuffle).to.equal('none');
        });

        it('enemy shuffle off', function () {
            expect(getRandomizerSettings().enemizer.enemy_shuffle).to.equal('none');
        });

        it('default enemy damage', function () {
            expect(getRandomizerSettings().enemizer.enemy_damage).to.equal('default');
        });

        it('default enemy health', function () {
            expect(getRandomizerSettings().enemizer.enemy_health).to.equal('default');
        });
    });
});