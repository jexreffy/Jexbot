'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');
const broadcastMessage = require('../../routines/broadcastMessage');

describe('broadcastMessage', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    beforeEach(function () {
        mockApp.sendToDiscordRaceChannel = function(guildId, message) { };
        mockApp.routines = {
            broadcastTwitch: function(app, context, message) { }
        };
    });

    context('verify broadcast message works properly', function () {
        it('verify that the message is broadcast to both Discord and Twitch', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves({ id: 1 });
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastTwitch');

            let context = {
                guildId: mockApp.config['botOwnerGuild']
            };

            broadcastMessage(mockApp, context, 'This is the message', false);

            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, 'This is the message')).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
        });

        it('verify that the message is marked up bold for Discord', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves({ id: 1 });
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastTwitch');

            let context = {
                guildId: mockApp.config['botOwnerGuild']
            };

            broadcastMessage(mockApp, context, 'This is the message', true);

            expect(sendStub.calledOnce).to.be.true;
            expect(sendStub.calledWith(context.guildId, '**This is the message**')).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
        });
    });
});