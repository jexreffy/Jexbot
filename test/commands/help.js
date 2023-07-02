'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command help', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: { },
        routines: { }
    };

    const CommandHelp = require('../../commands/help');
    let helpCommand = new CommandHelp(mockApp);

    beforeEach(function () {
        mockApp.sendToTwitchChannel = function(guildId, channel, message) { };
    });

    context('verify help command', function () {
        it('verify command has correct name', function (done) {
            expect(helpCommand.commandName).to.equal('help');
            done();
        });

        it('verify command is race command', function (done) {
            expect(helpCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify help cannot be executed unless it originates from Twitch', function (done) {
            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!help`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(helpCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.TWITCH;

            expect(helpCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify gatekeeper executes correctly for regular race', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!help`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(helpCommand.isCommandValid(context)).to.be.true;

            helpCommand.executeCommand(context);

            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, context.messageChannel, mockApp.config['helpRace'])).to.be.true;
        });

        it('verify gatekeeper executes correctly for ladder race', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();

            let context = {
                activeRace: {
                    ladder: true,
                    invitational: false
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!help`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(helpCommand.isCommandValid(context)).to.be.true;

            helpCommand.executeCommand(context);

            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, context.messageChannel, mockApp.config['helpLadder'])).to.be.true;
        });

        it('verify gatekeeper executes correctly for invitational race', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();

            let context = {
                activeRace: {
                    ladder: false,
                    invitational: true
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!help`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`,
                displayName: `jexreffy`
            }

            expect(helpCommand.isCommandValid(context)).to.be.true;

            helpCommand.executeCommand(context);

            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, context.messageChannel, mockApp.config['helpInvitational'])).to.be.true;
        });
    });
});