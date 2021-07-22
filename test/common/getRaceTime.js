'use strict'
const expect = require('chai').expect;
const getRaceTime = require('../../common/getRaceTime');

describe('getRaceTime', function() {
    context('check times are valid', function() {
        it('00:00:00', function() {
            expect(getRaceTime(0)).to.equal('00:00:00');
        });

        it('00:00:01', function() {
            expect(getRaceTime(1000)).to.equal('00:00:01');
        });

        it('00:00:10', function() {
            expect(getRaceTime(10000)).to.equal('00:00:10');
        });

        it('00:01:00', function() {
            expect(getRaceTime(60000)).to.equal('00:01:00');
        });

        it('00:10:00', function() {
            expect(getRaceTime(600000)).to.equal('00:10:00');
        });

        it('01:00:00', function() {
            expect(getRaceTime(3600000)).to.equal('01:00:00');
        });

        it('10:00:00', function() {
            expect(getRaceTime(36000000)).to.equal('10:00:00');
        });
    });
});