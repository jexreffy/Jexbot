"use strict"
const Mysql = require('mysql2');
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

            this.#server.sotw[guildId] = [0, 0, 0, 0];
            this.#server.sotwSeeds[guildId] = [{}, {}, {}, {}];
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
            if (err)
            {
                console.log(err);
                return;
            }

            connection.query(`SELECT
                    players.id as id,
                    players.discordId as discordId,
                    players.username as username,
                    players.twitch as twitch,
                    players.streaming as streaming,
                    players.twitchBot as twitchBot
                  FROM players`, (playerErr, playerRows) => {
                if (playerErr) {
                    connection.release();
                    throw playerErr;
                }

                playerRows.forEach((playerRow) => {
                    let player = players.find(x => x.discordId === playerRow.discordId);

                    if (!player) {
                        player = {};
                        players.push(player);
                    }

                    player.id = playerRow.id;
                    player.discordId = playerRow.discordId;
                    player.username = playerRow.username;
                    player.twitch = playerRow.twitch;
                    player.streaming = playerRow.streaming === 1;
                    player.twitchBot = playerRow.twitchBot === 1;
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
                            server.sotw[sotwRow.server][3] = sotwRow.tourney;

                            if (sotwRow.easy_seed) {
                                server.sotwSeeds[sotwRow.server][0] = JSON.parse(sotwRow.easy_seed);
                                server.sotwSeeds[sotwRow.server][1] = JSON.parse(sotwRow.medium_seed);
                                server.sotwSeeds[sotwRow.server][2] = JSON.parse(sotwRow.hard_seed);
                                server.sotwSeeds[sotwRow.server][3] = JSON.parse(sotwRow.tourney_seed);
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

    isUsernameUnique(discordId, username) {
        let found = false;
        this.#players.forEach(player => {
            if (player.username === username && player.discordId !== discordId) {
                found = true;
            }
        });

        return !found;
    }

    getPlayerUsername(discordId) {
        let playerIndex = this.#getPlayerIndexByDiscordId(discordId);
        return this.#players[playerIndex].username;
    }

    setPlayerUsername(discordId, username) {
        let unique = this.isUsernameUnique(username);

        if (!unique) return;

        let playerIndex = this.#getPlayerIndexByDiscordId(discordId);
        this.#players[playerIndex].username = username;
        this.#savePlayer(this.#players[playerIndex]);
    }

    getPlayerTwitch(discordId) {
        let playerIndex = this.#getPlayerIndexByDiscordId(discordId);
        return this.#players[playerIndex].twitch;
    }

    setPlayerTwitch(discordId, twitch) {
        let playerIndex = this.#getPlayerIndexByDiscordId(discordId);
        this.#players[playerIndex].twitch = twitch;
        this.#savePlayer(this.#players[playerIndex]);
    }

    getPlayerTwitchBot(discordId) {
        let playerIndex = this.#getPlayerIndexByDiscordId(discordId);
        return this.#players[playerIndex].streaming && this.#players[playerIndex].twitchBot;
    }

    setPlayerTwitchBot(discordId, twitchBot) {
        let playerIndex = this.#getPlayerIndexByDiscordId(discordId);
        this.#players[playerIndex].twitchBot = twitchBot;
        this.#savePlayer(this.#players[playerIndex]);
    }

    getPlayerStreaming(discordId) {
        let playerIndex = this.#getPlayerIndexByDiscordId(discordId);
        return this.#players[playerIndex].streaming;
    }

    setPlayerStreaming(discordId, streaming) {
        let playerIndex = this.#getPlayerIndexByDiscordId(discordId);
        this.#players[playerIndex].streaming = streaming;
        this.#savePlayer(this.#players[playerIndex]);
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

    getTourneySotw(guildId) {
        return this.#server.sotw[guildId][3];
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
            case "sotwtourney":
                index = 3;
                break;
        }

        return this.#server.sotwSeeds[guildId][index];
    }

    setSotwNext(guildId, easy, medium, hard, tourney, last) {
        this.#server.sotw[guildId][0] = easy;
        this.#server.sotw[guildId][1] = medium;
        this.#server.sotw[guildId][2] = hard;
        this.#server.sotw[guildId][3] = tourney;
        this.#server.sotwLast = last;
        this.#saveSotwNextData(guildId);
    }

    setSotwSeeds(guildId, easy, medium, hard, tourney) {
        this.#server.sotwSeeds[guildId][0] = easy;
        this.#server.sotwSeeds[guildId][1] = medium;
        this.#server.sotwSeeds[guildId][2] = hard;
        this.#server.sotwSeeds[guildId][3] = tourney;
        this.#saveSotwSeedData(guildId);
    }

    #getPlayerIndexByDiscordId(discordId) {
        if (discordId.length < 0) {
            console.log("Discord ID is not valid");
            return null;
        }
        let player = this.#players.find(x => x.discordId === discordId);
        if (player) {
            let index = this.#players.findIndex(x => x.discordId === discordId);
            return index;
        } else {
            console.log(`User ${discordId} not found!`);
            return null;
        }
    }

    addPlayerIfNotExists(discordId, username) {
        let player = this.#players.find(x => x.discordId === discordId);
        if (!player) {
            player = {
                discordId: discordId,
                username: username,
                twitch: null,
                streaming: false,
                twitchBot: false
            };

            this.#createPlayer(player);
            this.#players.push(player);
        }
    }

    #createPlayer(player) {
        this.#pool.getConnection(function(err, connection) {
            let sql = `INSERT INTO players(discordId, username, twitch, streaming, twitchBot) VALUES(?, ?, ?, ?, ?)`;
            let data = [player.discordId, player.username, player.twitch, player.streaming ? 1 : 0, player.twitchBot ? 1 : 0];

            connection.query(sql, data, (error, results, fields) => {
                connection.release();
                if (error) {
                    throw error;
                } else {
                    player.id = results.insertId;
                }
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
                SET easy = ?, medium = ?, hard = ?, tourney = ?
                WHERE server = ?`;

            let data = [server.sotw[guildId][0],
                        server.sotw[guildId][1],
                        server.sotw[guildId][2],
                        server.sotw[guildId][3],
                        guildId];

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
                SET easy_seed = ?, medium_seed = ?, hard_seed = ?, tourney_seed = ?
                WHERE server = ?`;

            let data = [JSON.stringify(server.sotwSeeds[guildId][0]),
                        JSON.stringify(server.sotwSeeds[guildId][1]),
                        JSON.stringify(server.sotwSeeds[guildId][2]),
                        JSON.stringify(server.sotwSeeds[guildId][3]),
                        guildId];

            connection.query(sql, data, (sotwError, results, fields) => {
                connection.release();
                if (sotwError) throw sotwError;
            });
        });
    }
}