'use strict'
const expect = require('chai').expect;

let App = require('../../mock/app');
let app = new App();
const CommandNew = require('../../commands/new');
let newCommand = new CommandNew(app);

describe('new', function() {
    context('verify new command', function () {
        it('verify command has correct name', function (done) {
            expect(newCommand.commandName).to.equal('new');
            done();
        });

        it('verify command is race command', function (done) {
            expect(newCommand.isRaceCommand).to.equal(true);
            done();
        });

        it('verify new race cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: app.config.botOwnerGuild,
                message: `.new`,
                messageChannel: null,
                origination: app.TWITCH,
                username: `jexreffy`
            }

            expect(newCommand.isCommandValid(context)).to.equal(false);

            context.origination = app.DISCORD;

            expect(newCommand.isCommandValid(context)).to.equal(true);

            done();
        });

        it('verify new race cannot be executed unless the previous race is finished', function (done) {
            let context = {
                activeRace: {
                    finished: false
                },
                guildId: app.config.botOwnerGuild,
                message: `.new`,
                messageChannel: null,
                origination: app.DISCORD,
                username: `jexreffy`
            }

            expect(newCommand.isCommandValid(context)).to.equal(false);

            context.activeRace.finished = true;

            expect(newCommand.isCommandValid(context)).to.equal(true);

            done();
        });

        it('verify new race cannot be executed unless a referee triggers it', function (done) {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: app.config.botOwnerGuild,
                message: `.new`,
                messageChannel: null,
                origination: app.DISCORD,
                username: `TheLostCarol`
            }

            expect(newCommand.isCommandValid(context)).to.equal(false);

            context.username = 'jexreffy'

            expect(newCommand.isCommandValid(context)).to.equal(true);

            done();
        });

        it('verify new race with no category is initiated correctly', async () => {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: app.config.botOwnerGuild,
                message: `.new`,
                messageChannel: null,
                origination: app.DISCORD,
                username: `jexreffy`
            }

            expect(newCommand.isCommandValid(context)).to.equal(true);

            newCommand.executeCommand(context);

            expect(context.activeRace.pingIndex).is.greaterThanOrEqual(0).and.lessThan(app.config['pings'].length);
            expect(context.activeRace.countdownIndex).is.greaterThanOrEqual(0).and.lessThan(app.config['countdowns'].length);
            expect(context.activeRace.mutlistream).to.equal('https://multistre.am/');
            expect(context.activeRace.status).to.equal('PRE-RACE: WAITING FOR PLAYERS TO JOIN');
            expect(context.activeRace.categoryToRoll).to.equal('standard');

            let category = app.db.getCategory('standard');

            expect(context.activeRace.category).to.equal(category.category);
            expect(context.activeRace.categoryName).to.equal(category.name);
            expect(context.activeRace.categoryDescription).to.equal(category.description);
            expect(context.activeRace.guessGameEnabled).to.equal(category.gtbk);
        });
    });

    after(function (done) {
        app.db.close();
        done();
    });
});