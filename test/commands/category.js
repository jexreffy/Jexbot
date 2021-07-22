'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command category', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    const CommandCategory = require('../../commands/category');
    let categoryCommand = new CommandCategory(mockApp);

    beforeEach(function () {
        mockApp.sendToTwitchChannel = function (guildId, channel, message) { };
    });

    context('verify category command', function () {
        it('verify command has correct name', function (done) {
            expect(categoryCommand.commandName).to.equal('category');
            done();
        });

        it('verify command is race command', function (done) {
            expect(categoryCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify category cannot be executed unless it originates from Twitch', function (done) {
            let context = {
                activeRace: {
                    categoryName: 'Standard',
                    categoryDescription: 'This is the standard category.'
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!category`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(categoryCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.TWITCH;

            expect(categoryCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify category executes correctly', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();

            let context = {
                activeRace: {
                    categoryName: 'Standard',
                    categoryDescription: 'This is the standard category.'
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!category`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(categoryCommand.isCommandValid(context)).to.be.true;

            categoryCommand.executeCommand(context);

            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(sendTwitchStub.calledWith(context.guildId, context.messageChannel, `${context.activeRace.categoryName}: ${context.activeRace.categoryDescription}`)).to.be.true;

            done();
        });
    });
});