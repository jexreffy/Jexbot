'use strict'
const expect = require('chai').expect;
const getRandom = require('../../routines/getRandom');

describe('getRandom', function() {
    context('verify random is within bounds', function() {
        it('1', function() {
            expect(getRandom(1)).is.greaterThanOrEqual(0).and.lessThan(1);
        });

        it('2', function() {
            expect(getRandom(2)).is.greaterThanOrEqual(0).and.lessThan(2);
        });

        it('5', function() {
            expect(getRandom(2)).is.greaterThanOrEqual(0).and.lessThan(5);
        });

        it('10', function() {
            expect(getRandom(2)).is.greaterThanOrEqual(0).and.lessThan(10);
        });

        it('17', function() {
            expect(getRandom(2)).is.greaterThanOrEqual(0).and.lessThan(17);
        });

        it('22', function() {
            expect(getRandom(2)).is.greaterThanOrEqual(0).and.lessThan(22);
        });

        it('33', function() {
            expect(getRandom(2)).is.greaterThanOrEqual(0).and.lessThan(33);
        });

        it('45', function() {
            expect(getRandom(2)).is.greaterThanOrEqual(0).and.lessThan(45);
        });

        it('61', function() {
            expect(getRandom(2)).is.greaterThanOrEqual(0).and.lessThan(61);
        });

        it('72', function() {
            expect(getRandom(2)).is.greaterThanOrEqual(0).and.lessThan(72);
        });

        it('156', function() {
            expect(getRandom(2)).is.greaterThanOrEqual(0).and.lessThan(156);
        });
    });
});