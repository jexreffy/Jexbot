'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');
const onRunnerFinished = require('../../routines/onRunnerFinished');

describe('onRunnerFinished', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {},
        sleep: function(m) {
            return new Promise((resolve, reject) => setTimeout(resolve, 1));
        }
    };

    beforeEach(function () {
        mockApp.getRacerRole = function (guildId) { };
        mockApp.findDiscordMemberById = function (guildId, discordId) { };
        mockApp.db = {
            setRaceData: function(guildId, race) { }
        };
        mockApp.routines = {
            broadcastMessage: function (app, context, message, bold, delay) { },
            gtbkWinner: function (app, context) { },
            updateRaceMessage: function(app, context) { }
        }
    });

    context('verify onRunnerFinished works properly', function () {
        it('verify that a runner finished in a race only updates the Race Message', async () => {
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
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let gtbkStub = sinon.stub(mockApp.routines, 'gtbkWinner');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    remainingPlayers: 2,
                    finished: false,
                    invitational: false,
                    teams: false,
                    multiworld: false,
                    spoilersAllowed: false,
                    status: 'RACE STARTED',
                    category: 'standard',
                    gtbkWinner: null,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy',
                            finished: true
                        },
                        {
                            discordId: `1`,
                            username: 'PhantomRyu'
                        },
                        {
                            discordId: `2`,
                            username: 'TjMaelstrom'
                        }
                    ]
                }
            };

            expect(context.activeRace.finished).to.be.false;
            expect(context.activeRace.spoilersAllowed).to.be.false;
            expect(context.activeRace.status).to.equal('RACE STARTED');

            onRunnerFinished(mockApp, context, context.activeRace.players[0]);

            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;
            expect(gtbkStub.notCalled).to.be.true;
            expect(updateStub.calledOnce).to.be.true;
        });

        it('verify that a runner finished which triggers spoilers being allowed executes correctly when gtbk winner has not been declared', async () => {
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
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let gtbkStub = sinon.stub(mockApp.routines, 'gtbkWinner');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    remainingPlayers: 2,
                    finished: false,
                    invitational: false,
                    teams: false,
                    multiworld: false,
                    spoilersAllowed: false,
                    status: 'RACE STARTED',
                    category: 'standard',
                    gtbkWinner: null,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy',
                            finished: true
                        },
                        {
                            discordId: `1`,
                            username: 'KillerApp23',
                            finished: true
                        },
                        {
                            discordId: `2`,
                            username: 'Antissim',
                            finished: true
                        },
                        {
                            discordId: `3`,
                            username: 'PhantomRyu'
                        },
                        {
                            discordId: `4`,
                            username: 'TjMaelstrom'
                        }
                    ]
                }
            };

            onRunnerFinished(mockApp, context, context.activeRace.players[2]);

            expect(context.activeRace.finished).to.be.false;
            expect(context.activeRace.spoilersAllowed).to.be.true;
            expect(context.activeRace.status).to.equal('RACE STARTED');

            await mockApp.sleep(1);

            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(gtbkStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;
        });

        it('verify that a runner finished which triggers spoilers being allowed executes correctly when gtbk winner has been declared', async () => {
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
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let gtbkStub = sinon.stub(mockApp.routines, 'gtbkWinner');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    remainingPlayers: 2,
                    finished: false,
                    invitational: false,
                    teams: false,
                    multiworld: false,
                    spoilersAllowed: false,
                    status: 'RACE STARTED',
                    category: 'standard',
                    gtbkWinner: 'lemming622',
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy',
                            finished: true
                        },
                        {
                            discordId: `1`,
                            username: 'KillerApp23',
                            finished: true
                        },
                        {
                            discordId: `2`,
                            username: 'Antissim',
                            finished: true
                        },
                        {
                            discordId: `3`,
                            username: 'PhantomRyu'
                        },
                        {
                            discordId: `4`,
                            username: 'TjMaelstrom'
                        }
                    ]
                }
            };

            onRunnerFinished(mockApp, context, context.activeRace.players[2]);

            expect(context.activeRace.finished).to.be.false;
            expect(context.activeRace.spoilersAllowed).to.be.true;
            expect(context.activeRace.status).to.equal('RACE STARTED');

            await mockApp.sleep(1);

            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(gtbkStub.notCalled).to.be.true;
            expect(updateStub.calledOnce).to.be.true;
        });

        it('verify that a runner finished in a race where spoilers are allowed does not retrigger it', async () => {
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
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let gtbkStub = sinon.stub(mockApp.routines, 'gtbkWinner');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    remainingPlayers: 1,
                    finished: false,
                    invitational: false,
                    teams: false,
                    multiworld: false,
                    spoilersAllowed: true,
                    status: 'RACE STARTED',
                    category: 'standard',
                    gtbkWinner: null,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy',
                            finished: true
                        },
                        {
                            discordId: `1`,
                            username: 'PhantomRyu',
                            finished: true
                        },
                        {
                            discordId: `2`,
                            username: 'WaltherIV',
                            finished: true
                        },
                        {
                            discordId: `3`,
                            username: 'Wallkicks',
                            finished: true
                        },
                        {
                            discordId: `4`,
                            username: 'TjMaelstrom'
                        }
                    ]
                }
            };

            onRunnerFinished(mockApp, context, context.activeRace.players[0]);

            expect(context.activeRace.finished).to.be.false;
            expect(context.activeRace.spoilersAllowed).to.be.true;
            expect(context.activeRace.status).to.equal('RACE STARTED');
            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;
            expect(gtbkStub.notCalled).to.be.true;
            expect(updateStub.calledOnce).to.be.true;
        });

        it('verify that a runner finished in an invitational race does not trigger spoilers', async () => {
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
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let gtbkStub = sinon.stub(mockApp.routines, 'gtbkWinner');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    remainingPlayers: 1,
                    finished: false,
                    invitational: true,
                    teams: false,
                    multiworld: false,
                    spoilersAllowed: false,
                    status: 'RACE STARTED',
                    category: 'standard',
                    gtbkWinner: null,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy',
                            finished: true
                        },
                        {
                            discordId: `1`,
                            username: 'PhantomRyu',
                            finished: true
                        },
                        {
                            discordId: `2`,
                            username: 'TjMaelstrom'
                        }
                    ]
                }
            };

            onRunnerFinished(mockApp, context, context.activeRace.players[0]);

            expect(context.activeRace.finished).to.be.false;
            expect(context.activeRace.spoilersAllowed).to.be.false;
            expect(context.activeRace.status).to.equal('RACE STARTED');
            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
            expect(broadcastStub.notCalled).to.be.true;
            expect(gtbkStub.notCalled).to.be.true;
            expect(updateStub.calledOnce).to.be.true;
        });

        it('verify that the last runner finished which triggers the end of the race executes correctly when gtbk winner has not been declared', async () => {
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
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let gtbkStub = sinon.stub(mockApp.routines, 'gtbkWinner');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    remainingPlayers: 0,
                    finished: false,
                    invitational: false,
                    teams: false,
                    multiworld: false,
                    spoilersAllowed: false,
                    status: 'RACE STARTED',
                    category: 'standard',
                    gtbkWinner: null,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy',
                            finished: true
                        },
                        {
                            discordId: `1`,
                            username: 'KillerApp23',
                            finished: true
                        },
                        {
                            discordId: `2`,
                            username: 'Antissim',
                            finished: true
                        },
                        {
                            discordId: `3`,
                            username: 'PhantomRyu',
                            finished: true
                        },
                        {
                            discordId: `4`,
                            username: 'TjMaelstrom',
                            finished: true
                        }
                    ]
                }
            };

            onRunnerFinished(mockApp, context, context.activeRace.players[4]);

            expect(context.activeRace.finished).to.be.true;
            expect(context.activeRace.spoilersAllowed).to.be.true;
            expect(context.activeRace.status).to.equal('RACE FINISHED');

            await mockApp.sleep(1);

            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(gtbkStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;
        });

        it('verify that the last runner finished which triggers the end of the race executes correctly when gtbk winner has not been declared', async () => {
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
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let gtbkStub = sinon.stub(mockApp.routines, 'gtbkWinner');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    remainingPlayers: 0,
                    finished: false,
                    invitational: false,
                    teams: false,
                    multiworld: false,
                    spoilersAllowed: false,
                    status: 'RACE STARTED',
                    category: 'standard',
                    gtbkWinner: 'lemming622',
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy',
                            finished: true
                        },
                        {
                            discordId: `1`,
                            username: 'KillerApp23',
                            finished: true
                        },
                        {
                            discordId: `2`,
                            username: 'Antissim',
                            finished: true
                        },
                        {
                            discordId: `3`,
                            username: 'PhantomRyu',
                            finished: true
                        },
                        {
                            discordId: `4`,
                            username: 'TjMaelstrom',
                            finished: true
                        }
                    ]
                }
            };

            onRunnerFinished(mockApp, context, context.activeRace.players[4]);

            expect(context.activeRace.finished).to.be.true;
            expect(context.activeRace.spoilersAllowed).to.be.true;
            expect(context.activeRace.status).to.equal('RACE FINISHED');

            await mockApp.sleep(1);

            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(gtbkStub.notCalled).to.be.true;
            expect(updateStub.calledOnce).to.be.true;
        });

        it('verify that the last runner finished which triggers the end of the race executes correctly for a teams race', async () => {
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
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let gtbkStub = sinon.stub(mockApp.routines, 'gtbkWinner');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    remainingPlayers: 0,
                    finished: false,
                    invitational: false,
                    teams: true,
                    multiworld: false,
                    spoilersAllowed: false,
                    status: 'RACE STARTED',
                    category: 'standard',
                    gtbkWinner: null,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy',
                            finished: true
                        },
                        {
                            discordId: `1`,
                            username: 'KillerApp23',
                            finished: true
                        },
                        {
                            discordId: `2`,
                            username: 'Antissim',
                            finished: true
                        },
                        {
                            discordId: `3`,
                            username: 'PhantomRyu',
                            finished: true
                        },
                        {
                            discordId: `4`,
                            username: 'TjMaelstrom',
                            finished: true
                        }
                    ]
                }
            };

            onRunnerFinished(mockApp, context, context.activeRace.players[4]);

            expect(context.activeRace.finished).to.be.true;
            expect(context.activeRace.spoilersAllowed).to.be.true;
            expect(context.activeRace.status).to.equal('RACE FINISHED');
            expect(context.activeRace.players[0].adjustment).to.be.undefined;
            expect(context.activeRace.players[1].adjustment).to.be.undefined;
            expect(context.activeRace.players[2].adjustment).to.be.undefined;
            expect(context.activeRace.players[3].adjustment).to.be.undefined;
            expect(context.activeRace.players[4].adjustment).to.be.undefined;

            await mockApp.sleep(1);

            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(gtbkStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;
        });

        it('verify that the last runner finished which triggers the end of the race executes correctly for a multiworld race', async () => {
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
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let gtbkStub = sinon.stub(mockApp.routines, 'gtbkWinner');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    remainingPlayers: 0,
                    finished: false,
                    invitational: false,
                    teams: false,
                    multiworld: true,
                    spoilersAllowed: false,
                    status: 'RACE STARTED',
                    category: 'standard',
                    gtbkWinner: null,
                    players: [
                        {
                            discordId: `0`,
                            username: 'jexreffy',
                            finished: true
                        },
                        {
                            discordId: `1`,
                            username: 'KillerApp23',
                            finished: true
                        },
                        {
                            discordId: `2`,
                            username: 'Antissim',
                            finished: true
                        },
                        {
                            discordId: `3`,
                            username: 'PhantomRyu',
                            finished: true
                        },
                        {
                            discordId: `4`,
                            username: 'TjMaelstrom',
                            finished: true
                        }
                    ]
                }
            };

            onRunnerFinished(mockApp, context, context.activeRace.players[4]);

            expect(context.activeRace.finished).to.be.true;
            expect(context.activeRace.spoilersAllowed).to.be.true;
            expect(context.activeRace.status).to.equal('RACE FINISHED');

            await mockApp.sleep(1);

            expect(roleStub.calledOnce).to.be.true;
            expect(memberStub.calledOnce).to.be.true;
            expect(removeStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(gtbkStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;
        });
    });
});