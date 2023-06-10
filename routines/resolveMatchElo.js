'use strict'
module.exports = (app, matchPlayers, category) => {
    let adjustments = [];
    for (let i = 0; i < matchPlayers.length; i++) {
        let adjustment = 0;
        let playerElo = app.db.getPlayerElo(matchPlayers[i].discordId, category);
        let playerK = app.db.checkPlayerRanked(matchPlayers[i].discordId, category) ? app.config['eloK'] : app.config['eloKPlacement'];

        for (let j = 0; j < i; j++) {
            if (matchPlayers[i].forfeited && matchPlayers[j].forfeited) {
                let opponentElo = app.db.getPlayerElo(matchPlayers[j].discordId, category);
                adjustment += calculatePoints(playerElo, opponentElo, playerK, app.config['eloN'], 0.5);
            } else {
                let opponentElo = app.db.getPlayerElo(matchPlayers[j].discordId, category);
                adjustment += calculatePoints(playerElo, opponentElo, playerK, app.config['eloN'], 0);
            }
        }

        for (let j = i + 1; j < matchPlayers.length; j++) {
            if (matchPlayers[i].forfeited && matchPlayers[j].forfeited) {
                let opponentElo = app.db.getPlayerElo(matchPlayers[j].discordId, category);
                adjustment += calculatePoints(playerElo, opponentElo, playerK, app.config['eloN'], 0.5);
            } else {
                let opponentElo = app.db.getPlayerElo(matchPlayers[j].discordId, category);
                adjustment += calculatePoints(playerElo, opponentElo, playerK, app.config['eloN'], 1);
            }
        }
        adjustments.push(adjustment);
    }

    for (let i = 0; i < matchPlayers.length; i++) {
        app.db.adjustElo(matchPlayers[i].discordId, category, adjustments[i]);
    }

    return adjustments;
}

function calculatePoints(eloA, eloB, kValue, n, result) {
    let eloDifference = eloA - eloB;
    let exponent = -(eloDifference / n);
    let expectedScore = 1 / (1 + Math.pow(10, exponent));
    let adjustment = kValue * (result - expectedScore);
    return roundToFive(adjustment);
}

function roundToFive(x) {
    if ((Math.abs(x) % 5) < 3 && x > 0) {
        return (Math.floor(x / 5)) * 5;
    } else if ((Math.abs(x) % 5) > 2 && x > 0) {
        return (Math.ceil(x / 5)) * 5;
    } else if ((Math.abs(x) % 5) < 3 && x < 0) {
        return (Math.ceil(x / 5)) * 5;
    } else {
        return (Math.floor(x / 5)) * 5;
    }
}