'use strict'
module.exports = (app, context, playerCount) => {
    let currentTeam = 0;
    let currentTeamCount = 0;
    let playersUsed = [];

    do {
        let i = app.routines['getRandom'](context.activeRace.players.length);
        if (playersUsed.indexOf(i) < 0) {
            playersUsed.push(i);

            context.activeRace.players[i].team = currentTeam;
            if (++currentTeamCount >= playerCount) {
                currentTeam++;
                currentTeamCount = 0;
            }
        }
    } while (playersUsed.length < context.activeRace.players.length);
}