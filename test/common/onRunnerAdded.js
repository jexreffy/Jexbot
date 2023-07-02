'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');
const onRunnerAdded = require('../../routines/onRunnerAdded');

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
        mockApp.findDiscordMemberById = function (guildId, discordId) { };
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
            let memberStub = sinon.stub(mockApp, 'findDiscordMemberById').returns(member);

            let context = {
                activeRace: {
                    remainingPlayers: 0,
                    players: []
                }
            };

            let player = {
                discordId: `0`
            }

            onRunnerAdded(mockApp, context, player);

            expect(context.activeRace.players).has.a.lengthOf(1);
            expect(context.activeRace.players[0].discordId).to.equal(`0`);
            expect(context.activeRace.remainingPlayers).to.equal(1);
            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(addStub.calledOnce).to.be.true;
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

            let player = {
                discordId: `1`
            }

            onRunnerAdded(mockApp, context, player);

            expect(context.activeRace.players).has.a.lengthOf(2);
            expect(context.activeRace.players[0].discordId).to.equal(`0`);
            expect(context.activeRace.players[1].discordId).to.equal(`1`);
            expect(context.activeRace.remainingPlayers).to.equal(2);
            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(addStub.calledOnce).to.be.true;
        });
    });
});