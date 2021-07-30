'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');
const onRunnerRemoved = require('../../routines/onRunnerRemoved');

describe('onRunnerRemoved', function() {
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
            getPlayerTwitch: function (username) { }
        };
    });

    context('verify onRunnerRemoved works properly', function () {
        it('verify that a runner is removed with only that runner in the list', async () => {
            let role = {
                id: 1
            };

            let member = {
                roles: {
                    remove: function (id) { }
                }
            };

            let removeStub = sinon.stub(member.roles, 'remove').resolves();
            let roleStub = sinon.stub(mockApp, 'getRacerRole').returns(role);
            let memberStub = sinon.stub(mockApp, 'findDiscordMember').returns(member);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');

            let context = {
                activeRace: {
                    remainingPlayers: 1,
                    multistream: 'https://multistre.am/jexreffy15/',
                    players: [
                        {
                            username: 'jexreffy'
                        }
                    ]
                }
            };

            onRunnerRemoved(mockApp, context, context.activeRace.players[0]);

            expect(context.activeRace.players).has.a.lengthOf(0);
            expect(context.activeRace.multistream).to.equal('https://multistre.am/');
            expect(context.activeRace.remainingPlayers).to.equal(0);
            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
        });

        it('verify that a runner is removed with multiple runners in the list', async () => {
            let role = {
                id: 1
            };

            let member = {
                roles: {
                    remove: function (id) { }
                }
            };

            let removeStub = sinon.stub(member.roles, 'remove').resolves();
            let roleStub = sinon.stub(mockApp, 'getRacerRole').returns(role);
            let memberStub = sinon.stub(mockApp, 'findDiscordMember').returns(member);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');

            let context = {
                activeRace: {
                    remainingPlayers: 2,
                    multistream: 'https://multistre.am/jexreffy15/PhantomRyu/',
                    players: [
                        {
                            username: 'jexreffy'
                        },
                        {
                            username: 'PhantomRyu',
                            twitch: '#PhantomRyu'
                        }
                    ]
                }
            };

            onRunnerRemoved(mockApp, context, context.activeRace.players[0]);

            expect(context.activeRace.players).has.a.lengthOf(1);
            expect(context.activeRace.players[0].username).to.equal('PhantomRyu');
            expect(context.activeRace.players[0].twitch).to.equal('#PhantomRyu');
            expect(context.activeRace.multistream).to.equal('https://multistre.am/PhantomRyu/');
            expect(context.activeRace.remainingPlayers).to.equal(1);
            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
        });

        it('verify that a runner is removed when the user does not have a twitch name', async () => {
            let role = {
                id: 1
            };

            let member = {
                roles: {
                    remove: function (id) { }
                }
            };

            let removeStub = sinon.stub(member.roles, 'remove').resolves();
            let roleStub = sinon.stub(mockApp, 'getRacerRole').returns(role);
            let memberStub = sinon.stub(mockApp, 'findDiscordMember').returns(member);
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns(null);

            let context = {
                activeRace: {
                    remainingPlayers: 2,
                    multistream: 'https://multistre.am/jexreffy/PhantomRyu/',
                    players: [
                        {
                            username: 'jexreffy'
                        },
                        {
                            username: 'PhantomRyu',
                            twitch: '#PhantomRyu'
                        }
                    ]
                }
            };

            onRunnerRemoved(mockApp, context, context.activeRace.players[0]);

            expect(context.activeRace.players).has.a.lengthOf(1);
            expect(context.activeRace.players[0].username).to.equal('PhantomRyu');
            expect(context.activeRace.players[0].twitch).to.equal('#PhantomRyu');
            expect(context.activeRace.multistream).to.equal('https://multistre.am/PhantomRyu/');
            expect(context.activeRace.remainingPlayers).to.equal(1);
            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
        });
    });
});