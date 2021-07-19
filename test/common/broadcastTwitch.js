'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');
const broadcastTwitch = require('../../common/broadcastTwitch');

describe('broadcastTwitch', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    beforeEach(function () {
        mockApp.isConnectedToTwitch = function(guildId) { };
        mockApp.getTwitchChannels = function(guildId) { };
        mockApp.sendToTwitchChannel = function(guildId, channel, message) { };
    });

    context('verify broadcast twitch works properly', function () {
        it('verify that the message isn\'t broadcast if the guild is not connected to Twitch', async () => {
            let isConnectedStub = sinon.stub(mockApp, 'isConnectedToTwitch').returns(false);
            let getStub = sinon.stub(mockApp, 'getTwitchChannels').returns([]);
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();

            let context = {
                guildId: mockApp.config['botOwnerGuild']
            };

            broadcastTwitch(mockApp, context, 'This is the message');

            expect(isConnectedStub.calledOnce).to.be.true;
            expect(getStub.notCalled).to.be.true;
            expect(sendStub.notCalled).to.be.true;
        });

        it('verify that the message isn\'t broadcast if the guild is connected to Twitch but the channels list is empty', async () => {
            let isConnectedStub = sinon.stub(mockApp, 'isConnectedToTwitch').returns(true);
            let getStub = sinon.stub(mockApp, 'getTwitchChannels').returns([]);
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();

            let context = {
                guildId: mockApp.config['botOwnerGuild']
            };

            broadcastTwitch(mockApp, context, 'This is the message');

            expect(isConnectedStub.calledOnce).to.be.true;
            expect(getStub.calledOnce).to.be.true;
            expect(sendStub.notCalled).to.be.true;
        });

        it('verify that the message is broadcast if the guild is connected to the supplied twitch channels', async () => {
            let isConnectedStub = sinon.stub(mockApp, 'isConnectedToTwitch').returns(true);
            let getStub = sinon.stub(mockApp, 'getTwitchChannels').returns([ '#jexreffy', '#phantomryu', '#tjmaelstrom']);
            let sendStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();

            let context = {
                guildId: mockApp.config['botOwnerGuild']
            };

            broadcastTwitch(mockApp, context, 'This is the message');

            expect(isConnectedStub.calledOnce).to.be.true;
            expect(getStub.calledOnce).to.be.true;
            expect(sendStub.calledThrice).to.be.true;
            expect(sendStub.calledWith(context.guildId, '#jexreffy', 'This is the message')).to.be.true;
            expect(sendStub.calledWith(context.guildId, '#phantomryu', 'This is the message')).to.be.true;
            expect(sendStub.calledWith(context.guildId, '#tjmaelstrom', 'This is the message')).to.be.true;
        });
    });
});