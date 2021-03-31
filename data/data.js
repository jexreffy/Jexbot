const config = require('../config.json');
const playersDb = require('../data/players.json');
const serverDb = require('../data/server.json');
const raceDb = require('../data/race.json');
const eloConfig = require('../elo/eloConfig.json');
const path = require('path');
const fs = require('fs');

const defaultELO = (eloConfig.defaultELO);
const placementMatches = (eloConfig.placementMatches);

let players = playersDb;
let server = serverDb;
let races = raceDb;

function savePlayer(player) {
    let playerIndex = players.findIndex(x => x.username === player.username);
    if (playerIndex > -1) {
        players[playerIndex] = player;
    } else {
        players.push(player);
    }
    fs.writeFileSync(path.join(__dirname, '../data/players.json'), JSON.stringify(players, null, 2));
    players = playersDb;
}

function saveServerData() {
    fs.writeFileSync(path.join(__dirname, '../data/server.json'), JSON.stringify(server, null, 2));
    server = serverDb;
}

function saveRaceData() {
    fs.writeFileSync(path.join(__dirname, '../data/race.json'), JSON.stringify(races, null, 2));
    races = raceDb;
}

function getPlayerIndexByName(username) {
    if (players.length < 1) {
        players = playersDb;
    }
    if (username.length < 3) {
        console.log("Username" + username + " is shorter than 4 characters!");
        return null;
    }
    let player = players.find(x => x.username == username);
    if (player) {
        return players.findIndex(x => x.username == username);
    } else {
        savePlayer({ username: username });
    }
    return players.findIndex(x => x.username == username);
}

module.exports = {
    checkPlayerRanked: function(username, category) {
        let playerIndex = getPlayerIndexByName(username);
        if (!players[playerIndex][category]) {
            players[playerIndex][category] = {};
            players[playerIndex][category].matches = 0;
            return false;
        }
        return (players[playerIndex][category].matches >= placementMatches);
    },
    getPlayerTwitch: function(username) {
        let playerIndex = getPlayerIndexByName(username);
        return players[playerIndex].twitch;
    },
    setPlayerTwitch: function(username, twitch) {
        let playerIndex = getPlayerIndexByName(username);
        players[playerIndex].twitch = twitch;
        savePlayer(players[playerIndex]);
    },
    getPlayerTwitchBot: function(username) {
        let playerIndex = getPlayerIndexByName(username);
        return players[playerIndex].streaming && players[playerIndex].twitchBot;
    },
    setPlayerTwitchBot: function(username, twitchBot) {
        let playerIndex = getPlayerIndexByName(username);
        players[playerIndex].twitchBot = twitchBot;
        savePlayer(players[playerIndex]);
    },
    getPlayerStreaming: function(username) {
        let playerIndex = getPlayerIndexByName(username);
        return players[playerIndex].streaming;
    },
    setPlayerStreaming: function(username, streaming) {
        let playerIndex = getPlayerIndexByName(username);
        players[playerIndex].streaming = streaming;
        savePlayer(players[playerIndex]);
    },
    getPlayerElo: function(username, category) {
        let playerIndex = getPlayerIndexByName(username);
        if (!players[playerIndex][category]) {
            players[playerIndex][category] = {};
        }
        let elo = players[playerIndex][category].elo;
        if (elo) {
            return elo;
        } else {
            players[playerIndex][category].elo = 1000;
            savePlayer(players[playerIndex]);
            return 1000;
        }
    },
    adjustElo: function(player, category, adjustment) {
        let playerIndex = getPlayerIndexByName(player);
        if (players[playerIndex][category].elo) {
            players[playerIndex][category].elo += adjustment;
        } else {
            players[playerIndex][category].elo = defaultELO + adjustment;
        }
        if (players[playerIndex][category].matches) {
            players[playerIndex][category].matches += 1;
        } else {
            players[playerIndex][category].matches = 1;
        }
        savePlayer(players[playerIndex]);
    },
    adjustPb: function(player, category, time) {
        let playerIndex = getPlayerIndexByName(player.username);
        if (playerIndex > -1) {
            players[playerIndex][category].pb = time;
        }
        savePlayer(players[playerIndex]);
    },
    getCategoryLeaderboard: function(category) {
        let board = [];
        if (players.length < 1) {
            players = playersDb;
        }
        players.forEach(player => {
            if (player[category]) {
                if (player[category].elo && player[category].matches >= placementMatches) {
                    board.push({
                        username: player.username,
                        elo: player[category].elo
                    });
                }
            }
        });
        if (board.length == 0) {
            console.log('no board for "' + category + '"');
            return null;
        }
        board.sort((a, b) => (a.elo > b.elo) ? -1 : 1);
        return board;
    },
    getCategoryStats: function(category) {
        let board = [];
        let stats = {
            totalRuns: 0,
            categoryPlayers: 0
        };
        if (players.length < 1) {
            players = playersDb;
        }
        players.forEach(player => {
            if (player[category]) {
                if (player[category].elo && player[category].matches >= placementMatches) {
                    board.push({
                        username: player.username,
                        elo: player[category].elo
                    });
                }
                if(player[category].elo) {
                    stats.totalRuns += player[category].matches;
                    stats.categoryPlayers += 1;
                }
            }
        });
        if (board.length == 0) {
            console.log('no stats for "' + category + '"');
            return null;
        }
        board.sort((a, b) => (a.elo > b.elo) ? -1 : 1);
        stats.top = board.slice(0,3);
        return stats;
    },
    getPlayerStats: function(player) {
        let stats = {};
        stats.categories = [];
        if (players.length < 1) {
            players = playersDb;
        }
        let playerIndex = players.findIndex(x => x.username === player);
        if (playerIndex < 0) {
            return stats;
        }
        stats.twitch = 'https://www.twitch.tv/' + ((players[playerIndex].twitch) ? players[playerIndex].twitch : player);
        Object.keys(players[playerIndex]).forEach(key => {
            if (key != "username" && key != "twitch") {
                let board = this.getCategoryLeaderboard(key);
                let rank = 0;
                if (board) {
                    rank = board.findIndex(x => x.username == player) + 1;
                }
                if (rank < 1) {
                    rank = 'unranked';
                }
                stats.categories.push({
                    name: key,
                    rank: rank,
                    elo: players[playerIndex][key].elo,
                    matches: players[playerIndex][key].matches
                });
            }
        });
        return stats;
    },
    getSpaceballs: function() {
        return server.spaceballs;
    },
    setSpaceballs: function(time) {
        server.spaceballs = time;
        saveServerData();
    },
    getActiveRace: function() {
        return server.activeRace;
    },
    setActiveRace: function(guildId) {
        server.activeRace = guildId;
        saveServerData();
    },
    getRaceData: function(guildId) {
        return races[guildId];
    },
    setRaceData: function(guildId, updatedRace) {
        races[guildId] = updatedRace;
        saveRaceData();
    },
    getEasySotw: function(guildId) {
        return server.sotw[guildId][0];
    },
    getMediumSotw: function(guildId) {
        return server.sotw[guildId][1];
    },
    getHardSotw: function(guildId) {
        return server.sotw[guildId][2];
    },
    getLastSotw: function() {
        return server.sotwLast;
    },
    setSotw: function(guildId, easy, medium, hard, last) {
        server.sotw[guildId][0] = easy;
        server.sotw[guildId][1] = medium;
        server.sotw[guildId][2] = hard;
        server.sotwLast = last;
        saveServerData();
    }
};