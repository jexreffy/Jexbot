'use strict'
const expect = require('chai').expect;
const sinon = require('sinon');

const config = require('../../config.json');

describe('command crew', function() {
    let mockApp = {
        CRON: 'cron',
        DISCORD: 'discord',
        TWITCH: 'twitch',
        config: config,
        db: {},
        routines: {}
    };

    const CommandCrew = require('../../commands/crew');
    let crewCommand = new CommandCrew(mockApp);

    beforeEach(function () {
        mockApp.sendToTwitchChannel = function (guildId, channel, message) { };
        mockApp.db = {
            getPlayerTwitch: function (username) { },
            setRaceData: function (guildId, race) { }
        };
        mockApp.routines = {
            updateRaceMessage: function (app, context) { }
        };
    });


    context('verify crew command', function () {
        it('verify command has correct name', function (done) {
            expect(crewCommand.commandName).to.equal('crew');
            done();
        });

        it('verify command is race command', function (done) {
            expect(crewCommand.isRaceCommand).to.be.true;
            done();
        });

        it('verify crew can be executed from Twitch at any time', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    crew: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!crew`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(crewCommand.isCommandValid(context)).to.be.true;

            context.activeRace.started = true;

            expect(crewCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify crew cannot be executed from Discord if the race has started', function (done) {
            let context = {
                activeRace: {
                    started: true,
                    crew: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!crew`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(crewCommand.isCommandValid(context)).to.be.false;

            context.activeRace.started = false;

            expect(crewCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify crew cannot be executed from Discord if a referee does not trigger it', function (done) {
            let context = {
                activeRace: {
                    started: false,
                    crew: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!crew`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `TheLostCarol`
            }

            expect(crewCommand.isCommandValid(context)).to.be.false;

            context.username = 'jexreffy';

            expect(crewCommand.isCommandValid(context)).to.be.true;

            done();
        });

        it('verify crew cannot be executed from Discord if a crew member is not provided with the command', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    crew: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!crew`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(crewCommand.isCommandValid(context)).to.be.true;

            crewCommand.executeCommand(context);

            expect(sendTwitchStub.notCalled).to.be.true;
            expect(getTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(updateStub.notCalled).to.be.true;

            done();
        });

        it('verify crew cannot be executed from Discord if the crew member has already been added', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    crew: [
                        {
                            username: 'TheShadesAT'
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!crew TheShadesAT`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(crewCommand.isCommandValid(context)).to.be.true;

            crewCommand.executeCommand(context);

            expect(sendTwitchStub.notCalled).to.be.true;
            expect(getTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(updateStub.notCalled).to.be.true;

            done();
        });

        it('verify crew executes correctly when originating from Twitch', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('jexreffy15');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: true,
                    crew: [
                        {
                            username: "jexreffy",
                            twitch: "#jexreffy"
                        },
                        {
                            username: "PhantomRyu",
                            twitch: "#phantomryu"
                        },
                        {
                            username: "Antissim"
                        }
                    ]
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!crew`,
                messageChannel: '#jexreffy',
                origination: mockApp.TWITCH,
                username: `jexreffy`
            }

            expect(crewCommand.isCommandValid(context)).to.be.true;

            crewCommand.executeCommand(context);

            let message = mockApp.config['crewMessage'] + " ";

            for (let i = 0; i < context.activeRace.crew.length; i++) {
                if (context.activeRace.crew[i].twitch) {
                    message += `https://twitch.tv/${context.activeRace.crew[i].twitch.substr(1)}${i !== context.activeRace.crew.length - 1 ? ' ' : ''}`;
                } else {
                    message += `https://twitch.tv/${context.activeRace.crew[i].username}${i !== context.activeRace.crew.length - 1 ? ' ' : ''}`;
                }
            }

            expect(sendTwitchStub.calledOnce).to.be.true;
            expect(sendTwitchStub.calledWith(context.guildId, context.messageChannel, message)).to.be.true;
            expect(getTwitchStub.notCalled).to.be.true;
            expect(setRaceStub.notCalled).to.be.true;
            expect(updateStub.notCalled).to.be.true;

            done();
        });

        it('verify crew executes correctly when originating from Discord and Twitch is set for the crew member', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns('RVTEntertainment');
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    crew: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!crew TheShadesAT`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(crewCommand.isCommandValid(context)).to.be.true;

            crewCommand.executeCommand(context);

            expect(context.activeRace.crew[0].username).to.equal('TheShadesAT');
            expect(context.activeRace.crew[0].twitch).to.equal('#RVTEntertainment');
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });

        it('verify crew executes correctly when originating from Discord and Twitch is not set for the crew member', function (done) {
            let sendTwitchStub = sinon.stub(mockApp, 'sendToTwitchChannel').resolves();
            let getTwitchStub = sinon.stub(mockApp.db, 'getPlayerTwitch').returns(null);
            let setRaceStub = sinon.stub(mockApp.db, 'setRaceData');
            let updateStub = sinon.stub(mockApp.routines, 'updateRaceMessage');

            let context = {
                activeRace: {
                    started: false,
                    crew: []
                },
                guildId: mockApp.config.botOwnerGuild,
                message: `!crew TheShadesAT`,
                messageChannel: '#jexreffy',
                origination: mockApp.DISCORD,
                username: `jexreffy`
            }

            expect(crewCommand.isCommandValid(context)).to.be.true;

            crewCommand.executeCommand(context);

            expect(context.activeRace.crew[0].username).to.equal('TheShadesAT');
            expect(context.activeRace.crew[0].twitch).to.be.undefined;
            expect(sendTwitchStub.notCalled).to.be.true;
            expect(getTwitchStub.calledOnce).to.be.true;
            expect(setRaceStub.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;

            done();
        });
    });
});