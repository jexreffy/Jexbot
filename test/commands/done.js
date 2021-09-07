'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');
const getRandom = require('../../routines/getRandom');
const resetRace = require('../../routines/resetRace');
const setRaceCategory = require('../../routines/setRaceCategory');
const CommandNew = require("../../commands/new");

describe('command new', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {
            'getRandom': getRandom,
            'resetRace': resetRace,
            'setRaceCategory': setRaceCategory
        },
        getPingRole: function (guildId) {
            return `ping${guildId}`;
        },
        sleep: function (m) {
            return new Promise((resolve, reject) => setTimeout(resolve, m));
        }
    };

    const CommandDone = require('../../commands/done');
    let doneCommand = new CommandDone(mockApp);

    beforeEach(function () {
        mockApp.findDiscordMember = function (guildId, username) {};
        mockApp.sendToDiscordRaceChannel = function (guildId, message) {};
        mockApp.db = {
            getPlayerPB: function (username, category) {},
            setPlayerPB: function (username, category) {},
            setRaceData: function (guildId, race) {}
        };
        mockApp.routines = {
            broadcastMessage: function (app, context, message, bold) {},
            getRaceTime: function (time) {},
            onRunnerFinished: function (app, context, player) {}
        };
    });

    context('verify done command', function () {
        it('verify command has correct name', function (done) {
            expect(doneCommand.commandName).to.equal('done');
            done();
        });

        it('verify command is race command', function (done) {
            expect(doneCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify done cannot be executed unless it originates from Discord', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    players: [
                        {
                            username: "jexreffy"
                        },
                        {
                            username: "TjMaelstrom"
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(doneCommand.isCommandValid(context)).to.be.false;

            context.origination = mockApp.DISCORD;

            expect(doneCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify done cannot be executed if the race has not started', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    finished: false,
                    players: [
                        {
                            username: "jexreffy"
                        },
                        {
                            username: "TjMaelstrom"
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(doneCommand.isCommandValid(context)).to.be.false;

            context.activeRace.started = true;

            expect(doneCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify done cannot be executed if the race has finished', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: true,
                    players: [
                        {
                            username: "jexreffy"
                        },
                        {
                            username: "TjMaelstrom"
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(doneCommand.isCommandValid(context)).to.be.false;

            context.activeRace.finished = false;

            expect(doneCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify done cannot be executed if the player is not in the race', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    players: [
                        {
                            username: "jexreffy"
                        },
                        {
                            username: "TjMaelstrom"
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `PhantomRyu`
            }

            expect(doneCommand.isCommandValid(context)).to.be.false;

            context.username = 'jexreffy';

            expect(doneCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify done cannot be executed if the player has finished', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    players: [
                        {
                            username: "jexreffy"
                        },
                        {
                            username: "TjMaelstrom"
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(doneCommand.isCommandValid(context)).to.be.true;

            context.activeRace.players[0].finished = true;

            expect(doneCommand.isCommandValid(context)).to.be.false;

            done();
        });

        it('verify done cannot be executed if the player has forfeited', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    players: [
                        {
                            username: "jexreffy"
                        },
                        {
                            username: "TjMaelstrom"
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(doneCommand.isCommandValid(context)).to.be.true;

            context.activeRace.players[0].forfeited = true;

            expect(doneCommand.isCommandValid(context)).to.be.false;

            done();
        });

        it('verify done executes normally for a regular race', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves({ id: 1 });
            let getPBStub = sinon.stub(mockApp.db, 'getPlayerPB').returns(3000000);
            let setPBStub = sinon.stub(mockApp.db, 'setPlayerPB');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let getTimeStub = sinon.stub(mockApp.routines, 'getRaceTime').returns('1:00:00');
            let onFinishedStub = sinon.stub(mockApp.routines, 'onRunnerFinished');

            let context = {
                activeRace: {
                    startedAt: Date.now() - 3600000,
                    started: true,
                    finished: false,
                    teams: false,
                    relay: false,
                    category: "standard",
                    remainingPlayers: 2,
                    players: [
                        {
                            username: "jexreffy"
                        },
                        {
                            username: "TjMaelstrom"
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(doneCommand.isCommandValid(context)).to.be.true;

            doneCommand.executeCommand(context);

            expect(context.activeRace.remainingPlayers).to.equal(1);
            expect(context.activeRace.players[0].finished).to.be.true;
            expect(context.activeRace.players[0].time).to.equal(3600000);
            expect(sendStub.notCalled).to.be.true;
            expect(getPBStub.calledOnce).to.be.true;
            expect(setPBStub.notCalled).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(getTimeStub.calledOnce).to.be.true;
            expect(onFinishedStub.calledOnce).to.be.true;
        });

        it('verify done executes normally for a regular race with a Personal Best', async () => {
            let sendStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves({ id: 1 });
            let getPBStub = sinon.stub(mockApp.db, 'getPlayerPB').returns(6000000);
            let setPBStub = sinon.stub(mockApp.db, 'setPlayerPB');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let getTimeStub = sinon.stub(mockApp.routines, 'getRaceTime').returns('1:00:00');
            let onFinishedStub = sinon.stub(mockApp.routines, 'onRunnerFinished');

            let context = {
                activeRace: {
                    startedAt: Date.now() - 3600000,
                    started: true,
                    finished: false,
                    teams: false,
                    relay: false,
                    category: "standard",
                    remainingPlayers: 2,
                    players: [
                        {
                            username: "jexreffy"
                        },
                        {
                            username: "TjMaelstrom"
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(doneCommand.isCommandValid(context)).to.be.true;

            doneCommand.executeCommand(context);

            expect(context.activeRace.remainingPlayers).to.equal(1);
            expect(context.activeRace.players[0].finished).to.be.true;
            expect(context.activeRace.players[0].time).to.equal(3600000);
            expect(sendStub.notCalled).to.be.true;
            expect(getPBStub.calledOnce).to.be.true;
            expect(setPBStub.calledOnce).to.be.true;
            expect(setPBStub.calledWith('jexreffy', 'standard', 3600000)).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(getTimeStub.calledOnce).to.be.true;
            expect(onFinishedStub.calledOnce).to.be.true;
        });

        it('verify done does not declare a team finished if not all the players have finished', function (done) {
            let sendStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves({ id: 1 });
            let getPBStub = sinon.stub(mockApp.db, 'getPlayerPB').returns(3000000);
            let setPBStub = sinon.stub(mockApp.db, 'setPlayerPB');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let getTimeStub = sinon.stub(mockApp.routines, 'getRaceTime').returns('1:00:00');
            let onFinishedStub = sinon.stub(mockApp.routines, 'onRunnerFinished');

            let context = {
                activeRace: {
                    startedAt: Date.now() - 3600000,
                    started: true,
                    finished: false,
                    teams: true,
                    relay: false,
                    category: "standard",
                    remainingPlayers: 6,
                    players: [
                        {
                            username: "PhantomRyu",
                            team: 0
                        },
                        {
                            username: "KwehstopherWarken",
                            team: 0
                        },
                        {
                            username: "TjMaelstrom",
                            team: 0
                        },
                        {
                            username: "Quizbowl",
                            team: 1
                        },
                        {
                            username: "Cubsrule21",
                            team: 1
                        },
                        {
                            username: "jexreffy",
                            team: 1
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(doneCommand.isCommandValid(context)).to.be.true;

            doneCommand.executeCommand(context);

            expect(context.activeRace.remainingPlayers).to.equal(5);
            expect(context.activeRace.players[5].finished).to.be.true;
            expect(sendStub.notCalled).to.be.true;
            expect(getPBStub.calledOnce).to.be.true;
            expect(setPBStub.notCalled).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(getTimeStub.calledOnce).to.be.true;
            expect(onFinishedStub.calledOnce).to.be.true;

            done();
        });

        it('verify done does declare a team finished if all the players have finished', function (done) {
            let sendStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves({ id: 1 });
            let getPBStub = sinon.stub(mockApp.db, 'getPlayerPB').returns(3000000);
            let setPBStub = sinon.stub(mockApp.db, 'setPlayerPB');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let getTimeStub = sinon.stub(mockApp.routines, 'getRaceTime').returns('1:00:00');
            let onFinishedStub = sinon.stub(mockApp.routines, 'onRunnerFinished');

            let context = {
                activeRace: {
                    startedAt: Date.now() - 3600000,
                    started: true,
                    finished: false,
                    teams: true,
                    relay: false,
                    category: "standard",
                    remainingPlayers: 6,
                    players: [
                        {
                            username: "PhantomRyu",
                            team: 0
                        },
                        {
                            username: "KwehstopherWarken",
                            team: 0
                        },
                        {
                            username: "TjMaelstrom",
                            team: 0
                        },
                        {
                            username: "Quizbowl",
                            team: 1,
                            finished: true,
                        },
                        {
                            username: "Cubsrule21",
                            team: 1,
                            finished: true,
                        },
                        {
                            username: "jexreffy",
                            team: 1
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(doneCommand.isCommandValid(context)).to.be.true;

            doneCommand.executeCommand(context);

            expect(context.activeRace.remainingPlayers).to.equal(5);
            expect(context.activeRace.players[5].finished).to.be.true;
            expect(sendStub.notCalled).to.be.true;
            expect(getPBStub.calledOnce).to.be.true;
            expect(setPBStub.notCalled).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.calledTwice).to.be.true;
            expect(getTimeStub.calledOnce).to.be.true;
            expect(onFinishedStub.calledOnce).to.be.true;

            done();
        });

        it('verify done cannot be executed in a relay race if it is not their leg to play', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    finished: false,
                    teams: true,
                    relay: true,
                    players: [
                        {
                            username: "PhantomRyu",
                            team: 0,
                            leg: 0
                        },
                        {
                            username: "KwehstopherWarken",
                            team: 0,
                            leg: 1
                        },
                        {
                            username: "TjMaelstrom",
                            team: 0,
                            leg: 2
                        },
                        {
                            username: "Quizbowl",
                            team: 1,
                            leg: 0
                        },
                        {
                            username: "Cubsrule21",
                            team: 1,
                            leg: 1
                        },
                        {
                            username: "jexreffy",
                            team: 1,
                            leg: 2
                        }
                    ],
                    legs: [
                        {
                            category: "standard"
                        },
                        {
                            category: "laliho"
                        },
                        {
                            category: "crosskeys"
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            doneCommand.executeCommand(context);

            expect(context.activeRace.players[5].finished).to.be.undefined;

            context.activeRace.players[3].finished = true;
            context.activeRace.players[4].finished = true;

            doneCommand.executeCommand(context);

            expect(context.activeRace.players[5].finished).to.be.true;

            done();
        });

        it('verify done is executed in a relay race for the first runner', function (done) {
            let findStub = sinon.stub(mockApp, 'findDiscordMember').returns({ id: 1});
            let sendStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves({ id: 1 });
            let getPBStub = sinon.stub(mockApp.db, 'getPlayerPB').returns(3000000);
            let setPBStub = sinon.stub(mockApp.db, 'setPlayerPB');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let getTimeStub = sinon.stub(mockApp.routines, 'getRaceTime').returns('1:00:00');
            let onFinishedStub = sinon.stub(mockApp.routines, 'onRunnerFinished');

            let context = {
                activeRace: {
                    startedAt: Date.now() - 3600000,
                    started: true,
                    finished: false,
                    teams: true,
                    relay: true,
                    category: null,
                    remainingPlayers: 6,
                    players: [
                        {
                            username: "PhantomRyu",
                            team: 0,
                            leg: 0
                        },
                        {
                            username: "KwehstopherWarken",
                            team: 0,
                            leg: 1
                        },
                        {
                            username: "TjMaelstrom",
                            team: 0,
                            leg: 2
                        },
                        {
                            username: "jexreffy",
                            team: 1,
                            leg: 0
                        },
                        {
                            username: "Cubsrule21",
                            team: 1,
                            leg: 1
                        },
                        {
                            username: "Quizbowl",
                            team: 1,
                            leg: 2
                        }
                    ],
                    legs: [
                        {
                            category: "standard"
                        },
                        {
                            category: "laliho"
                        },
                        {
                            category: "crosskeys"
                        }
                    ],
                    legStartTime: [
                        0,
                        0
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(doneCommand.isCommandValid(context)).to.be.true;

            doneCommand.executeCommand(context);

            expect(context.activeRace.remainingPlayers).to.equal(5);
            expect(context.activeRace.players[3].finished).to.be.true;
            expect(context.activeRace.players[3].time).to.equal(3600000);
            expect(context.activeRace.legStartTime[1]).to.not.equal(0);
            expect(findStub.calledTwice).to.be.true;
            expect(sendStub.calledTwice).to.be.true;
            expect(getPBStub.calledOnce).to.be.true;
            expect(setPBStub.notCalled).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(getTimeStub.calledTwice).to.be.true;
            expect(onFinishedStub.calledOnce).to.be.true;

            done();
        });

        it('verify done is executed in a relay race for a non-last runner', function (done) {
            let findStub = sinon.stub(mockApp, 'findDiscordMember').returns({ id: 1});
            let sendStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves({ id: 1 });
            let getPBStub = sinon.stub(mockApp.db, 'getPlayerPB').returns(3000000);
            let setPBStub = sinon.stub(mockApp.db, 'setPlayerPB');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let getTimeStub = sinon.stub(mockApp.routines, 'getRaceTime').returns('1:00:00');
            let onFinishedStub = sinon.stub(mockApp.routines, 'onRunnerFinished');

            let context = {
                activeRace: {
                    startedAt: Date.now() - 10600000,
                    started: true,
                    finished: false,
                    teams: true,
                    relay: true,
                    category: null,
                    remainingPlayers: 6,
                    players: [
                        {
                            username: "PhantomRyu",
                            team: 0,
                            leg: 0
                        },
                        {
                            username: "KwehstopherWarken",
                            team: 0,
                            leg: 1
                        },
                        {
                            username: "TjMaelstrom",
                            team: 0,
                            leg: 2
                        },
                        {
                            username: "Cubsrule21",
                            team: 1,
                            leg: 0,
                            finished: true,
                            time: 7000000
                        },
                        {
                            username: "jexreffy",
                            team: 1,
                            leg: 1
                        },
                        {
                            username: "Quizbowl",
                            team: 1,
                            leg: 2
                        }
                    ],
                    legs: [
                        {
                            category: "standard"
                        },
                        {
                            category: "laliho"
                        },
                        {
                            category: "crosskeys"
                        }
                    ],
                    legStartTime: [
                        0,
                        0
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(doneCommand.isCommandValid(context)).to.be.true;

            doneCommand.executeCommand(context);

            expect(context.activeRace.remainingPlayers).to.equal(5);
            expect(context.activeRace.players[4].finished).to.be.true;
            expect(context.activeRace.players[4].time).to.equal(3600000);
            expect(context.activeRace.legStartTime[1]).to.not.equal(0);
            expect(findStub.calledTwice).to.be.true;
            expect(sendStub.calledTwice).to.be.true;
            expect(getPBStub.calledOnce).to.be.true;
            expect(setPBStub.notCalled).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(getTimeStub.calledTwice).to.be.true;
            expect(onFinishedStub.calledOnce).to.be.true;

            done();
        });

        it('verify done is executed in a relay race for the last runner', function (done) {
            let findStub = sinon.stub(mockApp, 'findDiscordMember').returns({ id: 1});
            let sendStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves({ id: 1 });
            let getPBStub = sinon.stub(mockApp.db, 'getPlayerPB').returns(3000000);
            let setPBStub = sinon.stub(mockApp.db, 'setPlayerPB');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let getTimeStub = sinon.stub(mockApp.routines, 'getRaceTime').returns('1:00:00');
            let onFinishedStub = sinon.stub(mockApp.routines, 'onRunnerFinished');

            let context = {
                activeRace: {
                    startedAt: Date.now() - 18600000,
                    started: true,
                    finished: false,
                    teams: true,
                    relay: true,
                    category: null,
                    remainingPlayers: 6,
                    players: [
                        {
                            username: "PhantomRyu",
                            team: 0,
                            leg: 0
                        },
                        {
                            username: "KwehstopherWarken",
                            team: 0,
                            leg: 1
                        },
                        {
                            username: "TjMaelstrom",
                            team: 0,
                            leg: 2
                        },
                        {
                            username: "Cubsrule21",
                            team: 1,
                            leg: 0,
                            finished: true,
                            time: 7000000
                        },
                        {
                            username: "Quizbowl",
                            team: 1,
                            leg: 1,
                            finished: true,
                            forfeited: true,
                            time: 8000000
                        },
                        {
                            username: "jexreffy",
                            team: 1,
                            leg: 2
                        }
                    ],
                    legs: [
                        {
                            category: "standard"
                        },
                        {
                            category: "laliho"
                        },
                        {
                            category: "crosskeys"
                        }
                    ],
                    legStartTime: [
                        0,
                        0
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(doneCommand.isCommandValid(context)).to.be.true;

            doneCommand.executeCommand(context);

            expect(context.activeRace.remainingPlayers).to.equal(5);
            expect(context.activeRace.players[5].finished).to.be.true;
            expect(context.activeRace.players[5].time).to.equal(3600000);
            expect(context.activeRace.legStartTime[1]).to.equal(0);
            expect(findStub.notCalled).to.be.true;
            expect(sendStub.notCalled).to.be.true;
            expect(getPBStub.calledOnce).to.be.true;
            expect(setPBStub.notCalled).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.calledTwice).to.be.true;
            expect(getTimeStub.calledTwice).to.be.true;
            expect(onFinishedStub.calledOnce).to.be.true;

            done();
        });

        it('verify in a relay race that a forfeited player on the other team starts the countdown for them', function (done) {
            let findStub = sinon.stub(mockApp, 'findDiscordMember').returns({ id: 1});
            let sendStub = sinon.stub(mockApp, 'sendToDiscordRaceChannel').resolves({ id: 1 });
            let getPBStub = sinon.stub(mockApp.db, 'getPlayerPB').returns(3000000);
            let setPBStub = sinon.stub(mockApp.db, 'setPlayerPB');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let broadcastStub = sinon.stub(mockApp.routines, 'broadcastMessage');
            let getTimeStub = sinon.stub(mockApp.routines, 'getRaceTime').returns('1:00:00');
            let onFinishedStub = sinon.stub(mockApp.routines, 'onRunnerFinished');

            let context = {
                activeRace: {
                    startedAt: Date.now() - 3600000,
                    started: true,
                    finished: false,
                    teams: true,
                    relay: true,
                    category: null,
                    remainingPlayers: 5,
                    players: [
                        {
                            username: "PhantomRyu",
                            team: 0,
                            leg: 0,
                            finished: true,
                            forfeited: true
                        },
                        {
                            username: "KwehstopherWarken",
                            team: 0,
                            leg: 1
                        },
                        {
                            username: "TjMaelstrom",
                            team: 0,
                            leg: 2
                        },
                        {
                            username: "jexreffy",
                            team: 1,
                            leg: 0,
                        },
                        {
                            username: "Quizbowl",
                            team: 1,
                            leg: 1
                        },
                        {
                            username: "Cubsrule21",
                            team: 1,
                            leg: 2
                        }
                    ],
                    legs: [
                        {
                            category: "standard"
                        },
                        {
                            category: "laliho"
                        },
                        {
                            category: "crosskeys"
                        }
                    ],
                    legStartTime: [
                        0,
                        0
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `.done`,
                messageChannel: null,
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(doneCommand.isCommandValid(context)).to.be.true;

            doneCommand.executeCommand(context);

            expect(context.activeRace.remainingPlayers).to.equal(4);
            expect(context.activeRace.players[3].finished).to.be.true;
            expect(context.activeRace.players[3].time).to.equal(3600000);
            expect(context.activeRace.legStartTime[0]).to.not.equal(0);
            expect(context.activeRace.legStartTime[1]).to.not.equal(0);
            expect(findStub.callCount).to.equal(3);
            expect(sendStub.callCount).to.equal(3);
            expect(getPBStub.calledOnce).to.be.true;
            expect(setPBStub.notCalled).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(broadcastStub.calledOnce).to.be.true;
            expect(getTimeStub.calledTwice).to.be.true;
            expect(onFinishedStub.calledOnce).to.be.true;

            done();
        });
    });
});