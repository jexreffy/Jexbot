'use strict'
const expect = require('chai').expect;

let App = require('../../mock/app');
let app = new App();
const CommandInvitational = require('../../commands/invitational');
let invitationalCommand = new CommandInvitational(app);

describe('invitational', function() {
    context('verify invitational command', function () {
        it('verify command has correct name', function (done) {
            expect(invitationalCommand.commandName).to.equal('invitational');
            done();
        });

        it('verify command is race command', function (done) {
            expect(invitationalCommand.isRaceCommand).to.equal(true);
            done();
        });

        it('verify invitational race cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: app.config.botOwnerGuild,
                message: `.invitational`,
                messageChannel: null,
                origination: app.TWITCH,
                username: `jexreffy`
            }

            expect(invitationalCommand.isCommandValid(context)).to.equal(false);

            context.origination = app.DISCORD;

            expect(invitationalCommand.isCommandValid(context)).to.equal(true);

            done();
        });

        it('verify invitational race cannot be executed unless the previous race is finished', function (done) {
            let context = {
                activeRace: {
                    finished: false
                },
                guildId: app.config.botOwnerGuild,
                message: `.invitational`,
                messageChannel: null,
                origination: app.DISCORD,
                username: `jexreffy`
            }

            expect(invitationalCommand.isCommandValid(context)).to.equal(false);

            context.activeRace.finished = true;

            expect(invitationalCommand.isCommandValid(context)).to.equal(true);

            done();
        });

        it('verify invitational race cannot be executed unless a referee triggers it', function (done) {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: app.config.botOwnerGuild,
                message: `.invitational`,
                messageChannel: null,
                origination: app.DISCORD,
                username: `TheLostCarol`
            }

            expect(invitationalCommand.isCommandValid(context)).to.equal(false);

            context.username = 'jexreffy'

            expect(invitationalCommand.isCommandValid(context)).to.equal(true);

            done();
        });

        it('verify invitational race with no category is initiated correctly', async () => {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: app.config.botOwnerGuild,
                message: `.invitational`,
                messageChannel: null,
                origination: app.DISCORD,
                username: `jexreffy`
            }

            expect(invitationalCommand.isCommandValid(context)).to.equal(true);

            invitationalCommand.executeCommand(context);

            await app.sleep(1);

            expect(context.activeRace.ladder).to.equal(false);
            expect(context.activeRace.invitational).to.equal(true);
            expect(context.activeRace.locked).to.equal(true);
            expect(context.activeRace.teams).to.equal(false);
            expect(context.activeRace.relay).to.equal(false);
            expect(context.activeRace.started).to.equal(false);
            expect(context.activeRace.countdownIndex).is.greaterThanOrEqual(0).and.lessThan(app.config['countdowns'].length);
            expect(context.activeRace.mutlistream).to.equal('https://multistre.am/');
            expect(context.activeRace.status).to.equal('INVITATIONAL RACE: WAITING FOR PLAYERS TO READY UP');
            expect(context.activeRace.categoryToRoll).to.equal('standard');

            let category = app.db.getCategory('standard');

            expect(context.activeRace.category).to.equal(category.category);
            expect(context.activeRace.categoryName).to.equal(category.name);
            expect(context.activeRace.categoryDescription).to.equal(category.description);
            expect(context.activeRace.guessGameEnabled).to.equal(category.gtbk);

            let messages = app.getRaceChannelMessages(context.guildId);

            expect(messages).has.a.lengthOf(1);
        });

        it('verify invitational relay race is initiated correctly', async () => {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: app.config.botOwnerGuild,
                message: `.invitational relay`,
                messageChannel: null,
                origination: app.DISCORD,
                username: `jexreffy`
            }

            expect(invitationalCommand.isCommandValid(context)).to.equal(true);

            invitationalCommand.executeCommand(context);

            await app.sleep(1);

            expect(context.activeRace.ladder).to.equal(false);
            expect(context.activeRace.invitational).to.equal(true);
            expect(context.activeRace.locked).to.equal(true);
            expect(context.activeRace.teams).to.equal(true);
            expect(context.activeRace.relay).to.equal(true);
            expect(context.activeRace.started).to.equal(false);
            expect(context.activeRace.countdownIndex).is.greaterThanOrEqual(0).and.lessThan(app.config['countdowns'].length);
            expect(context.activeRace.mutlistream).to.equal('https://multistre.am/');
            expect(context.activeRace.status).to.equal('INVITATIONAL RACE: WAITING FOR PLAYERS TO READY UP');

            let messages = app.getRaceChannelMessages(context.guildId);

            expect(messages).has.a.lengthOf(1);
        });
    });

    after(function (done) {
        app.db.close();
        done();
    });
});