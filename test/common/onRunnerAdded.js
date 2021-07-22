'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');
const onRunnerAdded = require('../../common/onRunnerAdded');

describe('onRunnerAdded', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    beforeEach(function () {
        mockApp.getRacerRole = function (guildId) { };
        mockApp.findDiscordMember = function (guildId, username) { };
        mockApp.db = {
            getPlayerStreaming: function(username) { },
            getPlayerTwitch: function(username) { }
        };
    });

    context('verify onRunnerAdded works properly', function () {
        it('verify that a runner is added with an empty runner list', async () => {
            let role = {
                id: 1
            };

            let member = {
                roles: {
                    add: function (id) { }
                }
            };

            let addStub = sinon.stub(member.roles, 'add').resolves();
            let roleStub = sinon.stub(mockApp, 'getRacerRole').returns(role);
            let memberStub = sinon.stub(mockApp, 'findDiscordMember').returns(member);
            let getStreamingStub = sinon.stub(mockApp.db, 'getPlayerStreaming').returns(true);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');

            let context = {
                activeRace: {
                    remainingPlayers: 0,
                    multistream: 'https://multistre.am/',
                    players: []
                }
            };

            let player = {
                username: 'jexreffy'
            }

            onRunnerAdded(mockApp, context, player);

            expect(context.activeRace.players).has.a.lengthOf(1);
            expect(context.activeRace.players[0].username).to.equal('jexreffy');
            expect(context.activeRace.players[0].twitch).to.equal('#jexreffy15');
            expect(context.activeRace.multistream).to.equal('https://multistre.am/jexreffy15/');
            expect(context.activeRace.remainingPlayers).to.equal(1);
            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(addStub.calledOnce).to.be.true;
            expect(getStreamingStub.calledOnce).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
        });

        it('verify that a runner is added with another runner in the list', async () => {
            let role = {
                id: 1
            };

            let member = {
                roles: {
                    add: function (id) { }
                }
            };

            let addStub = sinon.stub(member.roles, 'add').resolves();
            let roleStub = sinon.stub(mockApp, 'getRacerRole').returns(role);
            let memberStub = sinon.stub(mockApp, 'findDiscordMember').returns(member);
            let getStreamingStub = sinon.stub(mockApp.db, 'getPlayerStreaming').returns(true);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');

            let context = {
                activeRace: {
                    remainingPlayers: 1,
                    multistream: 'https://multistre.am/PhantomRyu/',
                    players: [
                        {
                            username: 'PhantomRyu',
                            twitch: '#PhantomRyu'
                        }
                    ]
                }
            };

            let player = {
                username: 'jexreffy'
            }

            onRunnerAdded(mockApp, context, player);

            expect(context.activeRace.players).has.a.lengthOf(2);
            expect(context.activeRace.players[0].username).to.equal('PhantomRyu');
            expect(context.activeRace.players[0].twitch).to.equal('#PhantomRyu');
            expect(context.activeRace.players[1].username).to.equal('jexreffy');
            expect(context.activeRace.players[1].twitch).to.equal('#jexreffy15');
            expect(context.activeRace.multistream).to.equal('https://multistre.am/PhantomRyu/jexreffy15/');
            expect(context.activeRace.remainingPlayers).to.equal(2);
            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(addStub.calledOnce).to.be.true;
            expect(getStreamingStub.calledOnce).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
        });

        it('verify that a runner is added when streaming is not enabled', async () => {
            let role = {
                id: 1
            };

            let member = {
                roles: {
                    add: function (id) { }
                }
            };

            let addStub = sinon.stub(member.roles, 'add').resolves();
            let roleStub = sinon.stub(mockApp, 'getRacerRole').returns(role);
            let memberStub = sinon.stub(mockApp, 'findDiscordMember').returns(member);
            let getStreamingStub = sinon.stub(mockApp.db, 'getPlayerStreaming').returns(false);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');

            let context = {
                activeRace: {
                    remainingPlayers: 0,
                    multistream: 'https://multistre.am/',
                    players: []
                }
            };

            let player = {
                username: 'jexreffy'
            }

            onRunnerAdded(mockApp, context, player);

            expect(context.activeRace.players).has.a.lengthOf(1);
            expect(context.activeRace.players[0].username).to.equal('jexreffy');
            expect(context.activeRace.players[0].twitch).to.be.undefined;
            expect(context.activeRace.multistream).to.equal('https://multistre.am/');
            expect(context.activeRace.remainingPlayers).to.equal(1);
            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(addStub.calledOnce).to.be.true;
            expect(getStreamingStub.calledOnce).to.be.true;
            expect(getTwitchStub.notCalled).to.be.true;
        });

        it('verify that a runner is added when a twitch name is not set', async () => {
            let role = {
                id: 1
            };

            let member = {
                roles: {
                    add: function (id) { }
                }
            };

            let addStub = sinon.stub(member.roles, 'add').resolves();
            let roleStub = sinon.stub(mockApp, 'getRacerRole').returns(role);
            let memberStub = sinon.stub(mockApp, 'findDiscordMember').returns(member);
            let getStreamingStub = sinon.stub(mockApp.db, 'getPlayerStreaming').returns(true);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns(null);

            let context = {
                activeRace: {
                    remainingPlayers: 0,
                    multistream: 'https://multistre.am/',
                    players: []
                }
            };

            let player = {
                username: 'jexreffy'
            }

            onRunnerAdded(mockApp, context, player);

            expect(context.activeRace.players).has.a.lengthOf(1);
            expect(context.activeRace.players[0].username).to.equal('jexreffy');
            expect(context.activeRace.players[0].twitch).to.equal('#jexreffy');
            expect(context.activeRace.multistream).to.equal('https://multistre.am/jexreffy/');
            expect(context.activeRace.remainingPlayers).to.equal(1);
            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(addStub.calledOnce).to.be.true;
            expect(getStreamingStub.calledOnce).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
        });
    });
});