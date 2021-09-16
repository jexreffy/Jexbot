'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('cron gtAnnounce', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: { }
    };

    const CronGTannounce = require('../../cron/gtAnnounce');
    let gtAnnounceCron = new CronGTannounce(mockApp);

    beforeEach(function () {
        mockApp.routines = {
            broadcastMessage: function(app, context, message, bold, delay) { }
        };
    });

    context('verify gtAnnounce cron event', function () {
        it('verify cron has correct name', function (done) {
            expect(gtAnnounceCron.cronName).to.equal('gtAnnounce');
            done();
        });

        it('verify cron is guild based', function (done) {
            expect(gtAnnounceCron.isGuildBased).to.be.true;
            done();
        });

        it('verify gtAnnounce cannot tick if the race has not started', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    finished: false,
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: false,
                    startedAt: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: null,
                messageChannel: null,
                origination: mockApp.CRON,
                username: null
            }

            expect(gtAnnounceCron.shouldTick(context)).to.be.false;

            context.activeRace.started = true;

            expect(gtAnnounceCron.shouldTick(context)).to.be.true;

            done();
        });

        it('verify gtAnnounce cannot tick if the race has finished', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: false,
                    startedAt: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: null,
                messageChannel: null,
                origination: mockApp.CRON,
                username: null
            }

            expect(gtAnnounceCron.shouldTick(context)).to.be.true;

            context.activeRace.started = false;

            expect(gtAnnounceCron.shouldTick(context)).to.be.false;

            done();
        });

        it('verify gtAnnounce cannot tick if the race is a ladder or invitational race', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: false,
                    startedAt: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: null,
                messageChannel: null,
                origination: mockApp.CRON,
                username: null
            }

            expect(gtAnnounceCron.shouldTick(context)).to.be.true;

            context.activeRace.ladder = true;

            expect(gtAnnounceCron.shouldTick(context)).to.be.false;

            context.activeRace.ladder = false;
            context.activeRace.invitational = true;

            expect(gtAnnounceCron.shouldTick(context)).to.be.false;

            done();
        });

        it('verify gtAnnounce cannot tick unless the guess game is enabled', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: false,
                    guessGameStarted: false,
                    startedAt: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: null,
                messageChannel: null,
                origination: mockApp.CRON,
                username: null
            }

            expect(gtAnnounceCron.shouldTick(context)).to.be.false;

            context.activeRace.guessGameEnabled = true;

            expect(gtAnnounceCron.shouldTick(context)).to.be.true;

            done();
        });

        it('verify gtAnnounce cannot tick unless the guess game has not started', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: false,
                    startedAt: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: null,
                messageChannel: null,
                origination: mockApp.CRON,
                username: null
            }

            expect(gtAnnounceCron.shouldTick(context)).to.be.true;

            context.activeRace.guessGameStarted = true;

            expect(gtAnnounceCron.shouldTick(context)).to.be.false;

            done();
        });

        it('verify gtAnnounce cannot tick unless the race is past the minimum start time', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: false,
                    startedAt: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 + 1000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: null,
                messageChannel: null,
                origination: mockApp.CRON,
                username: null
            }

            expect(gtAnnounceCron.shouldTick(context)).to.be.false;

            context.activeRace.startedAt -= 2000;

            expect(gtAnnounceCron.shouldTick(context)).to.be.true;

            done();
        });

        it('verify gtAnnounce ticks properly', function (done) {
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');

            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    ladder: false,
                    invitational: false,
                    guessGameEnabled: true,
                    guessGameStarted: false,
                    startedAt: Date.now() - mockApp.config['minimumGuessStartSeconds'] * 1000 - 1000
                },
                guildId: mockApp.config.botOwnerGuild,
                message: null,
                messageChannel: null,
                origination: mockApp.CRON,
                username: null
            }

            expect(gtAnnounceCron.shouldTick(context)).to.be.true;

            gtAnnounceCron.tick(context);

            expect(context.activeRace.guessGameStarted).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;

            done();
        });
    });
});