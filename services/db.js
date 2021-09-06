"use strict"
const Mysql = require('mysql');
const raceDb = require('../data/race.json');
const path = require('path');
const fs = require('fs');

module.exports = class JexDatabase {
    #app;
    #categoryKeys = {
        alttpr: [],
        ff4fe: []
    };
    #categories = {
        alttpr: {},
        ff4fe: {}
    };
    #players = [];
    #pool;
    #races = raceDb;
    #server = {
        "spaceballs": 0,
        "activeRace": null,
        "sotwLast": 0,
        "sotw": {},
        "sotwSeeds": {}
    };

    constructor(app, connection) {
        this.#app = app;
        this.#pool = Mysql.createPool(connection);

        this.#initializeServer();
        this.#initializeCategories('alttpr');
        this.#initializeCategories('ff4fe');
        this.#initializePlayers();
    }

    close() {
        this.#pool.end();
    }

    #initializeServer() {
        for (let i = 0; i < this.#app.guilds.length; i++) {
            let guildId = this.#app.guilds[i];

            this.#server.sotw[guildId] = [0, 0, 0];
            this.#server.sotwSeeds[guildId] = [{}, {}, {}];
        }
    }

    #initializeCategories(game) {
        fs.readdir(`./categories/${game}/`, (err, files) => {
            files.forEach(file => {
                const category = require(`../categories/${game}/${file}`);
                const categoryKey = file.split('.')[0];

                this.#categoryKeys[game].push(categoryKey);
                this.#categories[game][categoryKey] = category;
            });
        });
    }

    #initializePlayers() {
        let players = this.#players;
        let server = this.#server;
        this.#pool.getConnection(function(err, connection) {
            connection.query(`SELECT
                    players.id as id,
                    players.username as username,
                    players.twitch as twitch,
                    players.streaming as streaming,
                    players.twitchBot as twitchBot,
                    elo.category as category,
                    elo.elo as elo,
                    elo.matches as matches,
                    elo.pb as pb
                  FROM players, elo
                  WHERE players.id = elo.player_id`, (playerErr, playerRows) => {
                if (playerErr) {
                    connection.release();
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
                    player[playerRow.category] = {};
                    player[playerRow.category].elo = playerRow.elo;
                    player[playerRow.category].matches = playerRow.matches;
                    player[playerRow.category].pb = playerRow.pb;
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

                            if (sotwRow.easy_seed) {
                                server.sotwSeeds[sotwRow.server][0] = JSON.parse(sotwRow.easy_seed);
                                server.sotwSeeds[sotwRow.server][1] = JSON.parse(sotwRow.medium_seed);
                                server.sotwSeeds[sotwRow.server][2] = JSON.parse(sotwRow.hard_seed);
                            }
                        });
                    });
                });
            });
        });
    }

    getCategory(game, category) {
      return this.#categories[game][category];
    }

    getCategories(game) {
      return this.#categoryKeys[game];
    }

    checkPlayerRanked(username, category) {
        let playerIndex = this.#getPlayerIndexByName(username);
        if (!this.#players[playerIndex][category]) {
            this.#players[playerIndex][category] = {};
            this.#players[playerIndex][category].matches = 0;
            return false;
        }
        return (this.#players[playerIndex][category].matches >= this.#app.config['eloPlacementMatches']);
    }

    getPlayerTwitch(username) {
        let playerIndex = this.#getPlayerIndexByName(username);
        return this.#players[playerIndex].twitch;
    }

    setPlayerTwitch(username, twitch) {
        let playerIndex = this.#getPlayerIndexByName(username);
        this.#players[playerIndex].twitch = twitch;
        this.#savePlayer(this.#players[playerIndex]);
    }

    getPlayerTwitchBot(username) {
        let playerIndex = this.#getPlayerIndexByName(username);
        return this.#players[playerIndex].streaming && this.#players[playerIndex].twitchBot;
    }

    setPlayerTwitchBot(username, twitchBot) {
        let playerIndex = this.#getPlayerIndexByName(username);
        this.#players[playerIndex].twitchBot = twitchBot;
        this.#savePlayer(this.#players[playerIndex]);
    }

    getPlayerStreaming(username) {
        let playerIndex = this.#getPlayerIndexByName(username);
        return this.#players[playerIndex].streaming;
    }

    setPlayerStreaming(username, streaming) {
        let playerIndex = this.#getPlayerIndexByName(username);
        this.#players[playerIndex].streaming = streaming;
        this.#savePlayer(this.#players[playerIndex]);
    }

    getPlayerPB(username, category) {
        let playerIndex = this.#getPlayerIndexByName(username);
        if (!this.#players[playerIndex][category]) {
            this.#players[playerIndex][category] = {};
        }
        let pb = this.#players[playerIndex][category].pb;
        if (pb) {
            return pb;
        } else {
            this.#players[playerIndex][category].elo = 1000;
            this.#players[playerIndex][category].matches = 0;
            this.#players[playerIndex][category].pb = 18000000;
            this.#createElo(this.#players[playerIndex], category);
            return 18000000;
        }
    }

    setPlayerPB(username, category, pb) {
        let playerIndex = this.#getPlayerIndexByName(username);
        this.#players[playerIndex][category].pb = pb;
        this.#saveElo(this.#players[playerIndex], category);
    }

    getPlayerElo(username, category) {
        let playerIndex = this.#getPlayerIndexByName(username);
        if (!this.#players[playerIndex][category]) {
            this.#players[playerIndex][category] = {};
        }
        let elo = this.#players[playerIndex][category].elo;
        if (elo) {
            return elo;
        } else {
            this.#players[playerIndex][category].elo = 1000;
            this.#players[playerIndex][category].matches = 0;
            this.#players[playerIndex][category].pb = 18000000;
            this.#createElo(this.#players[playerIndex], category);
            return 1000;
        }
    }

    adjustElo(player, category, adjustment) {
        let playerIndex = this.#getPlayerIndexByName(player);
        if (this.#players[playerIndex][category].elo) {
            this.#players[playerIndex][category].elo += adjustment;
        } else {
            this.#players[playerIndex][category].elo = this.#app.config['eloDefault'] + adjustment;
        }
        if (this.#players[playerIndex][category].matches) {
            this.#players[playerIndex][category].matches += 1;
        } else {
            this.#players[playerIndex][category].matches = 1;
        }
        this.#saveElo(this.#players[playerIndex], category);
    }

    getCategoryLeaderboard(category) {
        let board = [];
        this.#players.forEach(player => {
            if (player[category]) {
                if (player[category].elo && player[category].matches >= this.#app.config['eloPlacementMatches']) {
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
    }

    getCategoryStats(category) {
        let board = [];
        let stats = {
            totalRuns: 0,
            categoryPlayers: 0
        };
        this.#players.forEach(player => {
            if (player[category]) {
                if (player[category].elo && player[category].matches >= this.#app.config['eloPlacementMatches']) {
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
    }

    getPlayerStats(player) {
        let stats = {};
        stats.categories = [];
        let playerIndex = this.#players.findIndex(x => x.username === player);
        if (playerIndex < 0) {
            return stats;
        }
        stats.twitch = 'https://www.twitch.tv/' + ((this.#players[playerIndex].twitch) ? this.#players[playerIndex].twitch : player);
        Object.keys(this.#players[playerIndex]).forEach(key => {
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
                    elo: this.#players[playerIndex][key].elo,
                    matches: this.#players[playerIndex][key].matches
                });
            }
        });
        return stats;
    }

    getSpaceballs() {
        return this.#server.spaceballs;
    }

    setSpaceballs(time) {
        this.#server.spaceballs = time;
        this.#saveServerData();
    }

    getActiveRace() {
        return this.#server.activeRace;
    }

    setActiveRace(guildId) {
        this.#server.activeRace = guildId;
        this.#saveServerData();
    }

    getRaceData(guildId) {
        return this.#races[guildId];
    }

    setRaceData(guildId, updatedRace) {
        this.#races[guildId] = updatedRace;
        this.#saveRaceData();
    }

    getEasySotw(guildId) {
        return this.#server.sotw[guildId][0];
    }

    getMediumSotw(guildId) {
        return this.#server.sotw[guildId][1];
    }

    getHardSotw(guildId) {
        return this.#server.sotw[guildId][2];
    }

    getLastSotw() {
        return this.#server.sotwLast;
    }

    getSotwSeed(guildId, level) {
        let index = 0;
        switch (level) {
            case "sotwmedium":
                index = 1;
                break;
            case "sotwhard":
                index = 2;
                break;
        }

        return this.#server.sotwSeeds[guildId][index];
    }

    setSotwNext(guildId, easy, medium, hard, last) {
        this.#server.sotw[guildId][0] = easy;
        this.#server.sotw[guildId][1] = medium;
        this.#server.sotw[guildId][2] = hard;
        this.#server.sotwLast = last;
        this.#saveSotwNextData(guildId);
    }

    setSotwSeeds(guildId, easy, medium, hard) {
        this.#server.sotwSeeds[guildId][0] = easy;
        this.#server.sotwSeeds[guildId][1] = medium;
        this.#server.sotwSeeds[guildId][2] = hard;
        this.#saveSotwSeedData(guildId);
    }

    #getPlayerIndexByName(username) {
        if (username.length < 3) {
            console.log("Username" + username + " is shorter than 4 characters!");
            return null;
        }
        let player = this.#players.find(x => x.username === username);
        if (player) {
            return this.#players.findIndex(x => x.username === username);
        } else {
            player = {
                username: username,
                twitch: null,
                streaming: false,
                twitchBot: false,
                standard: {
                    elo: 1000,
                    matches: 0
                }
            };
            this.#players.push(player);
            this.#createPlayer(player);
            return this.#players.findIndex(x => x.username === username);
        }
    }

    #createPlayer(player) {
        this.#pool.getConnection(function(err, connection) {
            let sql = `INSERT INTO players(username, twitch, streaming, twitchBot) VALUES(?, ?, ?, ?)`;
            let data = [player.username, player.twitch, player.streaming ? 1 : 0, player.twitchBot ? 1 : 0];

            connection.query(sql, data, (error, results, fields) => {
                if (error) throw error;

                player.id = results.insertId;

                let sql = `UPDATE players
                    SET username = ?, twitch = ?, streaming = ?, twitchBot = ?
                    WHERE id = ?`;
                let data = [player.username, player.twitch, player.streaming ? 1 : 0, player.twitchBot ? 1 : 0, player.id];

                connection.query(sql, data, (error, results, fields) => {
                    connection.release();
                    if (error) throw error;
                });
            });
        });
    }

    #savePlayer(player) {
        this.#pool.getConnection(function(err, connection) {
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

    #createElo(player, category) {
        this.#pool.getConnection(function(err, connection) {
            let sql = `INSERT INTO elo(player_id, category) VALUES(?, ?)`;
            let data = [player.id, category];

            connection.query(sql, data, (error, results, fields) => {
                connection.release();
                if (error) throw error;
            });
        });
    }

    #saveElo(player, category) {
        this.#pool.getConnection(function(err, connection) {
            let sql = `UPDATE elo
                SET elo = ?, matches = ?, pb = ?
                WHERE player_id = ? AND category = ?`;
            let data = [player[category].elo, player[category].matches, player[category].pb, player.id, category];

            connection.query(sql, data, (error, results, fields) => {
                connection.release();
                if (error) throw error;
            });
        });
    }

    #saveRaceData() {
        fs.writeFileSync(path.join(__dirname, '../data/race.json'), JSON.stringify(this.#races, null, 2));
        this.#races = raceDb;
    }

    #saveServerData() {
        let server = this.#server;
        this.#pool.getConnection(function(err, connection) {
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

    #saveSotwNextData(guildId) {
        let server = this.#server;
        this.#pool.getConnection(function(err, connection) {
            let sql = `UPDATE sotw
                SET easy = ?, medium = ?, hard = ?
                WHERE server = ?`;

            let data = [server.sotw[guildId][0], server.sotw[guildId][1], server.sotw[guildId][2], guildId];

            connection.query(sql, data, (sotwError, results, fields) => {
                if (sotwError) {
                    connection.release();
                    throw sotwError;
                }

                sql = `UPDATE server SET sotw = ? WHERE id = ?`;
                data = [server.sotwLast, 1];

                connection.query(sql, data, (error, results, fields) => {
                    connection.release();
                    if (error) throw error;
                });
            });
        });
    }

    #saveSotwSeedData(guildId) {
        let server = this.#server;
        this.#pool.getConnection(function(err, connection) {
            let sql = `UPDATE sotw
                SET easy_seed = ?, medium_seed = ?, hard_seed = ?
                WHERE server = ?`;

            let data = [JSON.stringify(server.sotwSeeds[guildId][0]), JSON.stringify(server.sotwSeeds[guildId][1]), JSON.stringify(server.sotwSeeds[guildId][2]), guildId];

            connection.query(sql, data, (sotwError, results, fields) => {
                connection.release();
                if (sotwError) throw sotwError;
            });
        });
    }
}