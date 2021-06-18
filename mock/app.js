'use strict'
const JexDatabase = require('../services/db');
const MockDiscord = require('../mock/discord');
const MockTwitch = require('../mock/twitch');
const fs = require('fs');

module.exports = class MockApp {
    #config = require('../config.json');
    #db;
    #discord;
    #guilds = [];
    #routines = {};
    #twitch;

    CRON = 'cron';
    DISCORD = 'discord';
    TWITCH = 'twitch';

    constructor() {
        this.#initializeServices();
        this.#initializeRoutines();
    }

    #initializeServices() {
        this.#guilds = Object.keys(this.#config['guilds']);

        this.#db = new JexDatabase(this, {
            connectionLimit: 2,
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'jexbottest'
        });

        this.#discord = new MockDiscord(this);
        this.#twitch = new MockTwitch(this);
    }

    #initializeRoutines() {
        fs.readdir('./common/', (err, files) => {
            files.forEach(file => {
                const routine = require(`../common/${file}`);
                const routineName = file.split('.')[0];

                this.#routines[routineName] = routine;
            });
        });
    }

    get config() {
        return this.#config;
    }

    get db() {
        return this.#db;
    }

    get guilds() {
        return this.#guilds;
    }

    get routines() {
        return this.#routines;
    }

    sleep(m) {
        return new Promise((resolve, reject) => setTimeout(resolve, m));
    }

    findDiscordMember(guildId, username) {
        return this.#discord.findMember(guildId, username);
    }

    findDiscordMessage(guildId, messageId) {
        return this.#discord.findMessage(guildId, messageId);
    }

    getRacerRole(guildId) {
        return this.#discord.getRacerRole(guildId);
    }

    getPingRole(guildId) {
        return this.#discord.getPingRole(guildId);
    }

    getTwitchChannels(guildId) {
        return this.#twitch.getChannelsForGuild(guildId);
    }

    isConnectedToTwitch(guildId) {
        return this.#twitch.isConnectedToTwitch(guildId);
    }

    sendToDiscordRaceChannel(guildId, message) {
        return this.#discord.sendToRaceChannel(guildId, message);
    }

    sendToDiscordSotwChannel(guildId, message) {
        return this.#discord.sendToSotwChannel(guildId, message);
    }

    sendToTwitchChannel(guildId, channel, message) {
        return this.#twitch.sendToTwitchChannel(guildId, message);
    }
}