'use strict'
const expect = require('chai').expect;

let App = require('../../mock/app');
let app = new App();
const CommandLadder = require('../../commands/ladder');
let ladderCommand = new CommandLadder(app);

describe('ladder', function() {
    context('verify ladder command', function () {
        it('verify command has correct name', function (done) {
            expect(ladderCommand.commandName).to.equal('ladder');
            done();
        });

        it('verify command is race command', function (done) {
            expect(ladderCommand.isRaceCommand).to.equal(true);
            done();
        });

        it('verify ladder race cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: app.config.botOwnerGuild,
                message: `.ladder`,
                messageChannel: null,
                origination: app.TWITCH,
                username: `jexreffy`
            }

            expect(ladderCommand.isCommandValid(context)).to.equal(false);

            context.origination = app.DISCORD;

            expect(ladderCommand.isCommandValid(context)).to.equal(true);

            done();
        });

        it('verify ladder race cannot be executed unless the previous race is finished', function (done) {
            let context = {
                activeRace: {
                    finished: false
                },
                guildId: app.config.botOwnerGuild,
                message: `.ladder`,
                messageChannel: null,
                origination: app.DISCORD,
                username: `jexreffy`
            }

            expect(ladderCommand.isCommandValid(context)).to.equal(false);

            context.activeRace.finished = true;

            expect(ladderCommand.isCommandValid(context)).to.equal(true);

            done();
        });

        it('verify ladder race cannot be executed unless the bot owner triggers it', function (done) {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: app.config.botOwnerGuild,
                message: `.ladder`,
                messageChannel: null,
                origination: app.DISCORD,
                username: `TheLostCarol`
            }

            expect(ladderCommand.isCommandValid(context)).to.equal(false);

            context.username = 'jexreffy'

            expect(ladderCommand.isCommandValid(context)).to.equal(true);

            context.guildId = '8165160598710651651';

            expect(ladderCommand.isCommandValid(context)).to.equal(false);

            done();
        });

        it('verify ladder race with no category is initiated correctly', async () => {
            let context = {
                activeRace: {
                    finished: true
                },
                guildId: app.config.botOwnerGuild,
                message: `.ladder`,
                messageChannel: null,
                origination: app.DISCORD,
                username: `jexreffy`
            }

            expect(ladderCommand.isCommandValid(context)).to.equal(true);

            ladderCommand.executeCommand(context);

            await app.sleep(1);

            expect(context.activeRace.ladder).to.equal(true);
            expect(context.activeRace.invitational).to.equal(false);
            expect(context.activeRace.started).to.equal(true);
            expect(context.activeRace.startedAt).to.equal(context.activeRace.initiatedAt);
            expect(context.activeRace.categoryToRoll).to.equal('standard');

            let category = app.db.getCategory('standard');

            expect(context.activeRace.category).to.equal(category.category);
            expect(context.activeRace.categoryName).to.equal(category.name);
            expect(context.activeRace.categoryDescription).to.equal(category.description);
            expect(context.activeRace.guessGameEnabled).to.equal(category.gtbk);

            let messages = app.getRaceChannelMessages(context.guildId);

            expect(messages).has.a.lengthOf(0);
        });
    });

    after(function (done) {
        app.db.close();
        done();
    });
});