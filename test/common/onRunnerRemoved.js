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
        mockApp.findDiscordMemberById = function (guildId, discordId) { };
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
            let memberStub = sinon.stub(mockApp, 'findDiscordMemberById').returns(member);

            let context = {
                activeRace: {
                    remainingPlayers: 1,
                    players: [
                        {
                            discordId: `0`
                        }
                    ]
                }
            };

            onRunnerRemoved(mockApp, context, context.activeRace.players[0]);

            expect(context.activeRace.players).has.a.lengthOf(0);
            expect(context.activeRace.remainingPlayers).to.equal(0);
            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
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
            let memberStub = sinon.stub(mockApp, 'findDiscordMemberById').returns(member);

            let context = {
                activeRace: {
                    remainingPlayers: 2,
                    multistream: 'https://multistre.am/jexreffy15/PhantomRyu/',
                    players: [
                        {
                            discordId: `0`
                        },
                        {
                            discordId: `1`
                        }
                    ]
                }
            };

            onRunnerRemoved(mockApp, context, context.activeRace.players[0]);

            expect(context.activeRace.players).has.a.lengthOf(1);
            expect(context.activeRace.players[0].discordId).to.equal(`1`);
            expect(context.activeRace.remainingPlayers).to.equal(1);
            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
        });
    });
});