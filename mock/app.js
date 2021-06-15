'use strict'
const JexDatabase = require('../services/db');
const fs = require('fs');

module.exports = class MockApp {
    #config = require('../config.json');
    #db;
    #globalCommandKeys = [];
    #globalCommands = {};
    #guilds = [];
    #raceCommandKeys = [];
    #raceCommands = {};
    #routines = {};
    #sleep = m => new Promise(r => setTimeout(r, m));

    CRON = 'cron';
    DISCORD = 'discord';
    TWITCH = 'twitch';

    constructor() {
        this.#initializeServices();
        this.#initializeCommands();
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
    }

    #initializeCommands() {
        fs.readdir('./commands/', (err, files) => {
            files.forEach(file => {
                if (file !== 'command.js') {
                    const commandClass = require(`../commands/${file}`);
                    const command = new commandClass(this);
                    const commandName = command.commandName;

                    if (command.isRaceCommand) {
                        this.#raceCommandKeys.push(commandName);
                        this.#raceCommands[commandName] = command;
                    } else {
                        this.#globalCommandKeys.push(commandName);
                        this.#globalCommands[commandName] = command;
                    }
                }
            });
        });
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

    get sleep() {
        return this.#sleep;
    }
}