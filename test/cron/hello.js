'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('cron hello', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    const CronHello = require('../../cron/hello');
    let helloCron = new CronHello(mockApp);

    beforeEach(function () {
        mockApp.routines = {
            broadcastTwitch: function (app, context, message, delay) { }
        };
    });

    context('verify hello cron event', function () {
        it('verify cron has correct name', function (done) {
            expect(helloCron.cronName).to.equal('hello');
            done();
        });

        it('verify cron is guild based', function (done) {
            expect(helloCron.isGuildBased).to.be.true;
            done();
        });

        it('verify hello cannot tick if the race has not started', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    finished: false,
                    ladder: false,
                    invitational: false,
                    lastHello: null
                },
                guildId: mockApp.config.botOwnerGuild,
                message: null,
                messageChannel: null,
                origination: mockApp.CRON,
                username: null
            }

            expect(helloCron.shouldTick(context)).to.be.false;

            context.activeRace.started = true;

            expect(helloCron.shouldTick(context)).to.be.true;

            done();
        });

        it('verify hello cannot tick if the race has finished', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    invitational: false,
                    lastHello: null
                },
                guildId: mockApp.config.botOwnerGuild,
                message: null,
                messageChannel: null,
                origination: mockApp.CRON,
                username: null
            }

            expect(helloCron.shouldTick(context)).to.be.true;

            context.activeRace.finished = true;

            expect(helloCron.shouldTick(context)).to.be.false;

            done();
        });

        it('verify hello cannot tick unless the race is past the last hello time', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    invitational: false,
                    lastHello: Date.now() - mockApp.config['helloInterval'] * 1000 + 1000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: null,
                messageChannel: null,
                origination: mockApp.CRON,
                username: null
            }

            expect(helloCron.shouldTick(context)).to.be.false;

            context.activeRace.lastHello -= 2000;

            expect(helloCron.shouldTick(context)).to.be.true;

            done();
        });

        it('verify hello ticks properly for a regular race', function (done) {
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastTwitch');

            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    invitational: false,
                    lastHello: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: null,
                messageChannel: null,
                origination: mockApp.CRON,
                username: null
            }

            expect(helloCron.shouldTick(context)).to.be.true;

            helloCron.tick(context);

            expect(context.activeRace.lastHello).to.equal(Date.now());
            expect(broadcastStub.calledOnce).to.be.true;
            expect(broadcastStub.calledWith(mockApp, context, mockApp.config['helloRace'])).to.be.true;

            done();
        });

        it('verify hello ticks properly for a ladder race', function (done) {
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastTwitch');

            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: true,
                    invitational: false,
                    lastHello: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: null,
                messageChannel: null,
                origination: mockApp.CRON,
                username: null
            }

            expect(helloCron.shouldTick(context)).to.be.true;

            helloCron.tick(context);

            expect(context.activeRace.lastHello).to.equal(Date.now());
            expect(broadcastStub.calledOnce).to.be.true;
            expect(broadcastStub.calledWith(mockApp, context, mockApp.config['helloLadder'])).to.be.true;

            done();
        });

        it('verify hello ticks properly for an invitational race', function (done) {
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastTwitch');

            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    invitational: true,
                    lastHello: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: null,
                messageChannel: null,
                origination: mockApp.CRON,
                username: null
            }

            expect(helloCron.shouldTick(context)).to.be.true;

            helloCron.tick(context);

            expect(context.activeRace.lastHello).to.equal(Date.now());
            expect(broadcastStub.calledOnce).to.be.true;
            expect(broadcastStub.calledWith(mockApp, context, mockApp.config['helloInvitational'])).to.be.true;

            done();
        });
    });
});