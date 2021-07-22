'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');
const gtbkWinner = require('../../common/gtbkWinner');

describe('gtbkWinner', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    beforeEach(function () {
        mockApp.routines = {
            broadcastMessage: function (app, context, message, bold) { }
        };
    });

    context('verify gtbkWinner works properly', function () {
        it('verify that no guesses set yields no winner', async () => {
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    gtbk: -1,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    guesses: []
                }
            };

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            gtbkWinner(mockApp, context);

            expect(broadcastStub.notCalled).to.be.true;
        });

        //NOTE: GTBK is 1 based, guesses are 0 based

        it('verify that exact guess yields correct when only guess', async () => {
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    gtbk: 5,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    guesses: []
                }
            };

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            context.activeRace.guesses[4] = 'jexreffy';

            gtbkWinner(mockApp, context);

            expect(context.activeRace.gtbkGuess).to.equal(5);
            expect(context.activeRace.gtbkWinner).to.equal('jexreffy');
            expect(broadcastStub.calledOnce).to.be.true;
        });

        it('verify that exact guess yields correct amongst other guesses', async () => {
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    gtbk: 6,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    guesses: []
                }
            };

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            context.activeRace.guesses[1] = 'lemming622';
            context.activeRace.guesses[5] = 'jexreffy';
            context.activeRace.guesses[17] = 'dinosadies';

            gtbkWinner(mockApp, context);

            expect(context.activeRace.gtbkGuess).to.equal(6);
            expect(context.activeRace.gtbkWinner).to.equal('jexreffy');
            expect(broadcastStub.calledOnce).to.be.true;
        });

        it('verify that lower guess yields correct when only guess', async () => {
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    gtbk: 5,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    guesses: []
                }
            };

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            context.activeRace.guesses[2] = 'jexreffy';

            gtbkWinner(mockApp, context);

            expect(context.activeRace.gtbkGuess).to.equal(3);
            expect(context.activeRace.gtbkWinner).to.equal('jexreffy');
            expect(broadcastStub.calledOnce).to.be.true;
        });

        it('verify that lower guess yields correct via Price is Right rules', async () => {
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    gtbk: 9,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    guesses: []
                }
            };

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            context.activeRace.guesses[0] = 'oddwalls';
            context.activeRace.guesses[5] = 'jexreffy';
            context.activeRace.guesses[9] = 'web_mage';

            gtbkWinner(mockApp, context);

            expect(context.activeRace.gtbkGuess).to.equal(6);
            expect(context.activeRace.gtbkWinner).to.equal('jexreffy');
            expect(broadcastStub.calledOnce).to.be.true;
        });

        it('verify that lowest guess yields correct via Price is Right rules', async () => {
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    gtbk: 5,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    guesses: []
                }
            };

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            context.activeRace.guesses[0] = 'jexreffy';
            context.activeRace.guesses[5] = 'web_mage';
            context.activeRace.guesses[22] = 'lemming622';

            gtbkWinner(mockApp, context);

            expect(context.activeRace.gtbkGuess).to.equal(1);
            expect(context.activeRace.gtbkWinner).to.equal('jexreffy');
            expect(broadcastStub.calledOnce).to.be.true;
        });

        it('verify that higher guess yields correct when only guess', async () => {
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    gtbk: 22,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    guesses: []
                }
            };

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            context.activeRace.guesses[21] = 'jexreffy';

            gtbkWinner(mockApp, context);

            expect(context.activeRace.gtbkGuess).to.equal(22);
            expect(context.activeRace.gtbkWinner).to.equal('jexreffy');
            expect(broadcastStub.calledOnce).to.be.true;
        });

        it('verify that higher guess yields correct amongst other guesses', async () => {
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    gtbk: 1,
                    gtbkWinner: null,
                    gtbkGuess: null,
                    guesses: []
                }
            };

            for (let i = 0; i < 22; i++) {
                context.activeRace.guesses.push(null);
            }

            context.activeRace.guesses[10] = 'jexreffy';
            context.activeRace.guesses[13] = 'TheShadesAT';
            context.activeRace.guesses[14] = 'oddwalls';
            context.activeRace.guesses[22] = 'web_mage';

            gtbkWinner(mockApp, context);

            expect(context.activeRace.gtbkGuess).to.equal(11);
            expect(context.activeRace.gtbkWinner).to.equal('jexreffy');
            expect(broadcastStub.calledOnce).to.be.true;
        });
    });
});