const JexDatabase = require('../services/db');
const JexDiscord = require('../services/discord');
const JexHttp = require('../services/http');
const JexTwitch = require('../services/twitch');
const fs = require('fs');

module.exports = class JexBotApp {
    #axios = require('axios');
    #config = require('../config.json');
    #cronEvents = [];
    #db;
    #discord;
    #http;
    #globalCommandKeys = [];
    #globalCommands = {};
    #guilds = [];
    #raceCommandKeys = [];
    #raceCommands = {};
    #routines = {};
    #twitch;

    CRON = 'cron';
    DISCORD = 'discord';
    TWITCH = 'twitch';

    constructor() {
        this.#initializeServices();
        this.#initializeCommands();
        this.#initializeCron();
        this.#initializeRoutines();
    }

    #initializeServices() {
        this.#guilds = Object.keys(this.#config['guilds']);

        this.#db = new JexDatabase(this, {
            connectionLimit: 2,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        this.#discord = new JexDiscord(this);
        this.#http = new JexHttp(this);
        this.#twitch = new JexTwitch(this);
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

    #initializeCron() {
        fs.readdir('./cron/', (err, files) => {
            files.forEach(file => {
                if (file !== 'cron.js') {
                    const cronClass = require(`../cron/${file}`);
                    this.#cronEvents.push(new cronClass(this));
                }
            });
        });

        const nodeCron = require('node-cron');
        nodeCron.schedule('*/5 * * * * *', () => {
            this.#tickCron();
        }, {});
    }

    #initializeRoutines() {
        fs.readdir('./routines/', (err, files) => {
            files.forEach(file => {
                const routine = require(`./routines/${file}`);
                const routineName = file.split('.')[0];

                this.#routines[routineName] = routine;
            });
        });
    }

    get axios() {
        return this.#axios;
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

    connectToTwitch(guildId) {
        this.#twitch.connectToTwitch(guildId);
    }

    disconnectFromTwitch(guildId) {
        this.#twitch.disconnectFromTwitch(guildId);
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
        return this.#twitch.sendToTwitchChannel(guildId, channel, message);
    }

    onDiscordMessageReceived(message) {
        if (message.author.bot) return;

        const guildId = message.guild.id;
        const raceChannel = this.#discord.getRaceChannel(guildId);

        let context = {
            activeRace: this.#db.getRaceData(guildId),
            guildId: guildId,
            message: message.content,
            messageChannel: null,
            origination: this.DISCORD,
            username: message.author.username
        };

        if (message.channel.name === raceChannel.name) {
            this.#processRaceCommand(context);

            if (message) {
                message.delete().then().catch(console.error);
            }
        } else {
            context.messageChannel = message.channel;
            this.#processGlobalCommand(context);
        }
    }

    onTwitchMessageReceived(channel, tags, message, self) {
        if (self) return;

        const guildId = this.#twitch.getGuildForChannel(channel);

        let race = this.#db.getRaceData(guildId);

        let context = {
            activeRace: race,
            guildId: guildId,
            message: message,
            messageChannel: channel,
            origination: this.TWITCH,
            username: tags.username
        };

        this.#processRaceCommand(context);
    }

    #processRaceCommand(context) {
        let match = context.message.match(/^[.!]([a-zA-Z0-9]{0,30})/i);

        if (match && match[1] && this.#raceCommandKeys.indexOf(match[1]) >= 0) {
            let command = this.#raceCommands[match[1]];

            if (command.isCommandValid(context)) {
                command.executeCommand(context);
            }
        }
    }

    #processGlobalCommand(context) {
        for (let i = 0; i < this.#globalCommandKeys.length; i++) {
            let command = this.#globalCommands[this.#globalCommandKeys[i]];

            if (command.isCommandValid(context)) {
                command.executeCommand(context);
                break;
            }
        }
    }

    #tickCron() {
        let context = [];
        let shouldSave = [];

        for (let i = 0; i < this.#guilds.length; i++) {
            let guildId = this.#guilds[i];
            context.push({
                activeRace: this.#db.getRaceData(guildId),
                guildId: guildId,
                message: null,
                messageChannel: null,
                origination: this.CRON,
                username: null
            });

            shouldSave.push(false);
        }

        for (let i = 0; i < this.#cronEvents.length; i++) {
            let event = this.#cronEvents[i];

            if (event.isGuildBased) {
                for (let i = 0; i < context.length; i++) {
                    if (event.shouldTick(context[i])) {
                         shouldSave[i] = shouldSave[i] || event.tick(context[i]);
                    }
                }
            } else {
                if (event.shouldTick(null)) {
                    event.tick(null);
                }
            }
        }

        for (let i = 0; i < this.#cronEvents.length; i++) {
            if (shouldSave[i]) {
                this.#db.setRaceData(this.#guilds[i], context[i].activeRace);
            }
        }
    }
}