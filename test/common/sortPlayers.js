'use strict'
const expect = require('chai').expect;
const sortPlayers = require('../../common/sortPlayers');

describe('sortPlayers', function() {
    context('check sort algorithms work properly', function () {
        it('No additional parameters does not changes the order of the list', function() {

            let players = [
                {
                    username: 'jexreffy'
                },
                {
                    username: 'PhantomRyu'
                },
                {
                    username: 'TjMaelstrom'
                },
                {
                    username: 'Antissim'
                },
                {
                    username: 'KwehstopherWarken'
                },
                {
                    username: 'GynxyGirl'
                }
            ];

            sortPlayers(players, false, false);

            expect(players[0].username).to.equal('jexreffy');
            expect(players[1].username).to.equal('PhantomRyu');
            expect(players[2].username).to.equal('TjMaelstrom');
            expect(players[3].username).to.equal('Antissim');
            expect(players[4].username).to.equal('KwehstopherWarken');
            expect(players[5].username).to.equal('GynxyGirl');
        });

        it('Players that have finished with times go to the top of the list', function() {
            let players = [
                {
                    username: 'jexreffy',
                    time: 20000
                },
                {
                    username: 'PhantomRyu',
                    time: 30000
                },
                {
                    username: 'TjMaelstrom'
                },
                {
                    username: 'Antissim'
                },
                {
                    username: 'KwehstopherWarken',
                    time: 10000
                },
                {
                    username: 'GynxyGirl'
                }
            ];

            sortPlayers(players, false, false);

            expect(players[0].username).to.equal('KwehstopherWarken');
            expect(players[1].username).to.equal('jexreffy');
            expect(players[2].username).to.equal('PhantomRyu');
            expect(players[3].username).to.equal('TjMaelstrom');
            expect(players[4].username).to.equal('Antissim');
            expect(players[5].username).to.equal('GynxyGirl');
        });

        it('Players that have forfeited go to the bottom of the list', function() {
            let players = [
                {
                    username: 'jexreffy',
                    forfeited: true
                },
                {
                    username: 'PhantomRyu',
                },
                {
                    username: 'TjMaelstrom',
                    forfeited: true
                },
                {
                    username: 'Antissim'
                },
                {
                    username: 'KwehstopherWarken'
                },
                {
                    username: 'GynxyGirl'
                }
            ];

            sortPlayers(players, false, false);

            expect(players[0].username).to.equal('PhantomRyu');
            expect(players[1].username).to.equal('Antissim');
            expect(players[2].username).to.equal('KwehstopherWarken');
            expect(players[3].username).to.equal('GynxyGirl');
            expect(players[4].username).to.equal('jexreffy');
            expect(players[5].username).to.equal('TjMaelstrom');
        });

        it('Players with various times and forfeits sort correctly', function() {
            let players = [
                {
                    username: 'jexreffy',
                    forfeited: true
                },
                {
                    username: 'PhantomRyu',
                    time: 40000
                },
                {
                    username: 'TjMaelstrom',
                    forfeited: true
                },
                {
                    username: 'Antissim',
                    time: 30000
                },
                {
                    username: 'KwehstopherWarken',
                    time: 20000
                },
                {
                    username: 'GynxyGirl',
                    time: 10000
                }
            ];

            sortPlayers(players, false, false);

            expect(players[0].username).to.equal('GynxyGirl');
            expect(players[1].username).to.equal('KwehstopherWarken');
            expect(players[2].username).to.equal('Antissim');
            expect(players[3].username).to.equal('PhantomRyu');
            expect(players[4].username).to.equal('jexreffy');
            expect(players[5].username).to.equal('TjMaelstrom');
        });

        it('Teams are sorted by Team Number', function() {
            let players = [
                {
                    username: 'jexreffy',
                    team: 0
                },
                {
                    username: 'PhantomRyu',
                    team: 1
                },
                {
                    username: 'TjMaelstrom',
                    team: 0
                },
                {
                    username: 'Antissim',
                    team: 1
                },
                {
                    username: 'KwehstopherWarken',
                    team: 1
                },
                {
                    username: 'GynxyGirl',
                    team: 0
                }
            ];

            sortPlayers(players, true, false);

            expect(players[0].username).to.equal('jexreffy');
            expect(players[1].username).to.equal('TjMaelstrom');
            expect(players[2].username).to.equal('GynxyGirl');
            expect(players[3].username).to.equal('PhantomRyu');
            expect(players[4].username).to.equal('Antissim');
            expect(players[5].username).to.equal('KwehstopherWarken');
        });

        it('Teams with times and forfeits are sorted within teams', function() {
            let players = [
                {
                    username: 'jexreffy',
                    team: 0,
                    forfeited: true
                },
                {
                    username: 'PhantomRyu',
                    team: 1,
                    time: 20000
                },
                {
                    username: 'TjMaelstrom',
                    team: 0,
                    time: 20000
                },
                {
                    username: 'Antissim',
                    team: 1,
                    forfeited: true
                },
                {
                    username: 'KwehstopherWarken',
                    team: 1,
                    time: 40000
                },
                {
                    username: 'GynxyGirl',
                    team: 0,
                    time: 10000
                }
            ];

            sortPlayers(players, true, false);

            expect(players[0].username).to.equal('GynxyGirl');
            expect(players[1].username).to.equal('TjMaelstrom');
            expect(players[2].username).to.equal('jexreffy');
            expect(players[3].username).to.equal('PhantomRyu');
            expect(players[4].username).to.equal('KwehstopherWarken');
            expect(players[5].username).to.equal('Antissim');
        });

        it('Relay Teams sort by leg regardless of other circumstances', function() {
            let players = [
                {
                    username: 'jexreffy',
                    team: 0,
                    forfeited: true,
                    leg: 0
                },
                {
                    username: 'PhantomRyu',
                    team: 1,
                    time: 20000,
                    leg: 2
                },
                {
                    username: 'TjMaelstrom',
                    team: 0,
                    time: 20000,
                    leg: 2
                },
                {
                    username: 'Antissim',
                    team: 1,
                    forfeited: true,
                    leg: 0
                },
                {
                    username: 'KwehstopherWarken',
                    team: 1,
                    time: 40000,
                    leg: 1
                },
                {
                    username: 'GynxyGirl',
                    team: 0,
                    time: 100000,
                    leg: 1
                }
            ];

            sortPlayers(players, true, true);

            expect(players[0].username).to.equal('jexreffy');
            expect(players[1].username).to.equal('GynxyGirl');
            expect(players[2].username).to.equal('TjMaelstrom');
            expect(players[3].username).to.equal('Antissim');
            expect(players[4].username).to.equal('KwehstopherWarken');
            expect(players[5].username).to.equal('PhantomRyu');
        });
    });
});