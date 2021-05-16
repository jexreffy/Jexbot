const Mysql = require('mysql');
const raceDb = require('../data/race.json');
const eloConfig = require('../elo/eloConfig.json');
const path = require('path');
const fs = require('fs');

const defaultELO = (eloConfig.defaultELO);
const placementMatches = (eloConfig.placementMatches);

let races = raceDb;

let server = {
    "spaceballs": 0,
    "activeRace": null,
    "sotwLast": 0,
    "sotw": {
        "574586257079009280": [
            0,
            0,
            0
        ],
        "515731524616847367": [
            0,
            0,
            0
        ]
    }
};

let players = [];

let pool = Mysql.createPool({
    connectionLimit: 2,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

pool.getConnection(function(err, connection) {
    connection.query(`SELECT
                    players.id as id,
                    players.username as username,
                    players.twitch as twitch,
                    players.streaming as streaming,
                    players.twitchBot as twitchBot,
                    elo.mode as mode,
                    elo.elo as elo,
                    elo.matches as matches
                  FROM players, elo
                  WHERE players.id = elo.player_id`, (playerErr, playerRows) => {
        if (playerErr) {
            connection.release();
            console.log()
            throw playerErr;
        }

        playerRows.forEach((playerRow) => {
            let player = players.find(x => x.username === playerRow.username);

            if (!player) {
                player = {};
                players.push(player);
            }

            player.id = playerRow.id;
            player.username = playerRow.username;
            player.twitch = playerRow.twitch;
            player.streaming = playerRow.streaming === 1;
            player.twitchBot = playerRow.twitchBot === 1;
            player[playerRow.mode] = {};
            player[playerRow.mode].elo = playerRow.elo;
            player[playerRow.mode].matches = playerRow.matches;
        });

        connection.query(`SELECT * FROM server WHERE id = 1`, (serverErr, serverRow) => {
            if (serverErr) {
                connection.release();
                throw serverErr;
            }

            server.spaceballs = serverRow[0].spaceballs;
            server.activeRace = serverRow[0].active;
            server.sotwLast = serverRow[0].sotw;

            connection.query(`SELECT * FROM sotw`, (sotwErr, sotwRows) => {
                if (sotwErr) {
                    connection.release();
                    throw sotwErr;
                }

                sotwRows.forEach((sotwRow) => {
                    server.sotw[sotwRow.server][0] = sotwRow.easy;
                    server.sotw[sotwRow.server][1] = sotwRow.medium;
                    server.sotw[sotwRow.server][2] = sotwRow.hard;
                });
            });
        });
    });
});

function getPlayerIndexByName(username) {
    if (username.length < 3) {
        console.log("Username" + username + " is shorter than 4 characters!");
        return null;
    }
    let player = players.find(x => x.username === username);
    if (player) {
        return players.findIndex(x => x.username === username);
    } else {
        player = {
            username: username,
            twitch: null,
            streaming: false,
            twitchBot: false,
        };
        createPlayer(player);
    }
    return player;
}

function createPlayer(player) {
    pool.getConnection(function(err, connection) {
        let sql = `INSERT INTO players(username, twitch, streaming, twitchBot) VALUES(?)`;
        let data = [player.username, player.twitch, player.streaming ? 1 : 0, player.twitchBot ? 1 : 0];

        connection.query(sql, data, (error, results, fields) => {
            connection.release();
            if (error) throw error;

            player.id = results.insertId;
            players.push(player);
        });
    });
}

function savePlayer(player) {
    pool.getConnection(function(err, connection) {
        let sql = `UPDATE players
                SET username = ?, twitch = ?, streaming = ?, twitchBot = ?
                WHERE id = ?`;
        let data = [player.username, player.twitch, player.streaming ? 1 : 0, player.twitchBot ? 1 : 0, player.id];

        connection.query(sql, data, (error, results, fields) => {
            connection.release();
            if (error) throw error;
        });
    });
}

function createElo(player, category) {
    pool.getConnection(function(err, connection) {
        let sql = `INSERT INTO elo(player_id, mode) VALUES(?)`;
        let data = [player.id, category];

        connection.query(sql, data, (error, results, fields) => {
            connection.release();
            if (error) throw error;
        });
    });
}

function saveElo(player, category) {
    pool.getConnection(function(err, connection) {
        let sql = `UPDATE elo
                SET elo = ?, matches = ?
                WHERE player_id = ? AND mode = ?`;
        let data = [player[category].elo, player[category].matches, player.id, category];

        connection.query(sql, data, (error, results, fields) => {
            connection.release();
            if (error) throw error;
        });
    });
}

function saveRaceData() {
    fs.writeFileSync(path.join(__dirname, '../data/race.json'), JSON.stringify(races, null, 2));
    races = raceDb;
}

function saveServerData() {
    pool.getConnection(function(err, connection) {
        let sql = `UPDATE server
                SET spaceballs = ?, active = ?, sotw = ?
                WHERE id = ?`;

        let data = [server.spaceballs, server.activeRace, server.sotwLast, 1];

        connection.query(sql, data, (error, results, fields) => {
            connection.release();
            if (error) throw error;
        });
    });
}

function saveSotwData(guildId) {
    pool.getConnection(function(err, connection) {
        let sql = `UPDATE sotw
                SET easy = ?, medium = ?, hard = ?
                WHERE server = ?`;

        let data = [server.sotw[guildId][0], server.sotw[guildId][1], server.sotw[guildId][2], guildId];

        connection.query(sql, data, (sotwError, results, fields) => {
            if (sotwError) {
                connection.release();
                throw sotwError;
            }

            sql = `UPDATE server sotw = ? WHERE id = ?`;
            data = [server.sotwLast, 1];

            connection.query(sql, data, (error, results, fields) => {
                connection.release();
                if (error) throw error;
            });
        });
    });
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
            createElo(players[playerIndex], category);
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
        saveElo(players[playerIndex], category);
    },
    getCategoryLeaderboard: function(category) {
        let board = [];
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
        if (board.length === 0) {
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
        if (board.length === 0) {
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
        let playerIndex = players.findIndex(x => x.username === player);
        if (playerIndex < 0) {
            return stats;
        }
        stats.twitch = 'https://www.twitch.tv/' + ((players[playerIndex].twitch) ? players[playerIndex].twitch : player);
        Object.keys(players[playerIndex]).forEach(key => {
            if (key !== "id" && key !== "username" && key !== "twitch" && key !== "streaming" && key !== "twitchBot") {
                let board = this.getCategoryLeaderboard(key);
                let rank = 0;
                if (board) {
                    rank = board.findIndex(x => x.username === player) + 1;
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
        saveSotwData(guildId);
    }
}