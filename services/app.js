const JexDatabase = require('../services/db');
const JexDiscord = require('../services/discord');
//const JexHttp = require('../services/http');
const JexTwitch = require('../services/twitch');
const fs = require('fs');
const {join} = require("tmi.js/lib/commands");
const {EmbedBuilder} = require("discord.js");

module.exports = class JexBotApp {
    #axios = require('axios');
    #config = require('../config.json');
    #cronEvents = [];
    #db;
    #discord;
    //#http;
    #globalCommandKeys = [];
    #globalCommands = {};
    #guilds = [];
    #raceCommandKeys = [];
    #raceCommands = {};
    #routines = {};
    #twitch;

    CRON = 'cron';
    DISCORD = 'discord';
    HTTP = 'http';
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
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        this.#discord = new JexDiscord(this);
        //this.#http = new JexHttp(this);
        this.#twitch = new JexTwitch(this);
    }

    #initializeCommands() {
        fs.readdir('./commands/', (err, files) => {
            files.forEach(file => {
                if (file !== 'command.js' && file !== 'test.js') {
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
                const routine = require(`../routines/${file}`);
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

    findDiscordMemberById(guildId, id) {
        return this.#discord.findMemberById(guildId, id);
    }

    findDiscordMemberByUsername(guildId, username) {
        return this.#discord.findMemberById(guildId, username);
    }

    findDiscordMessage(guildId, messageId) {
        return this.#discord.findMessage(guildId, messageId);
    }

    findDiscordChannelById(guildId, channelName) {
        return this.#discord.getChannelById(guildId, channelName);
    }

    findDiscordChannelByName(guildId, channelName) {
        return this.#discord.getChannelByName(guildId, channelName);
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

    sendEmbedToDiscordRaceChannel(guildId, embed) {
        return this.#discord.sendEmbedToRaceChannel(guildId, embed);
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
        const member = this.#discord.findMemberById(guildId, message.author.id);

        let context = {
            activeRace: this.#db.getRaceData(guildId),
            guildId: guildId,
            message: message.content,
            messageChannel: null,
            origination: this.DISCORD,
            userId: message.author.id,
            username: message.author.username,
            displayName: member.displayName
        };

        this.#db.addPlayerIfNotExists(context.userId, context.displayName);

        if (message.channelId === raceChannel.id) {
            this.#processRaceCommand(context);

            if (message) {
                message.delete().then().catch(console.error);
            }
        } else {
            context.messageChannel = this.#discord.getChannelById(guildId, message.channelId);
            this.#processGlobalCommand(context);
        }
    }

    onTwitchMessageReceived(channel, tags, message, self) {
        if (self) return;

        const guildId = this.#twitch.getGuildForChannel(channel);

        let context = {
            activeRace: this.#db.getRaceData(guildId),
            guildId: guildId,
            message: message,
            messageChannel: channel,
            origination: this.TWITCH,
            username: tags.username,
            displayName: tags.username
        };

        this.#processRaceCommand(context);
    }

    onHttpCommandReceived(url) {

    }

    #processRaceCommand(context) {
        let match = context.message.match(/^[.!]([a-zA-Z0-9]{0,30})/i);

        let embed = new EmbedBuilder().setTitle('Command Received')
            .addFields(
                {name: 'Origination', value: context.origination, inline: false},
                {name: 'Message', value: context.message, inline: false},
                {name: 'User ID', value: context.userId, inline: false},
                {name: 'Username', value: context.username, inline: false},
                {name: 'Display Name', value: context.displayName, inline: false}
            );

        if (match && match[1] && this.#raceCommandKeys.indexOf(match[1]) >= 0) {
            let command = this.#raceCommands[match[1]];

            if (command.isCommandValid(context)) {
                command.executeCommand(context);

                embed.setColor(0x57f287);
                embed.addFields(
                    {name: 'Result', value: 'Success', inline: false}
                );
            } else {
                embed.setColor(0xED4245);
                embed.addFields(
                    {name: 'Result', value: 'Failed', inline: false},
                    {name: 'Reason', value: 'Command Not Valid', inline: false}
                );
            }
        } else {
            embed.setColor(0xED4245);
            embed.addFields(
                {name: 'Result', value: 'Failed', inline: false},
                {name: 'Reason', value: 'Command Not Found', inline: false}
            );
        }

        this.#discord.sendEmbedToLogChannel(context.guildId, embed);
    }

    #processGlobalCommand(context) {
        for (let i = 0; i < this.#globalCommandKeys.length; i++) {
            let command = this.#globalCommands[this.#globalCommandKeys[i]];

            if (command.isCommandValid(context)) {
                command.executeCommand(context);

                let embed = new EmbedBuilder().setTitle('Command Received')
                    .setColor(0x57f287)
                    .addFields(
                        {name: 'Origination', value: context.origination, inline: false},
                        {name: 'Message', value: context.message, inline: false},
                        {name: 'User ID', value: context.userId, inline: false},
                        {name: 'Username', value: context.username, inline: false},
                        {name: 'Display Name', value: context.displayName, inline: false},
                        {name: 'Result', value: 'Success', inline: false},
                        {name: 'Reason', value: 'Global Command Received', inline: false}
                    );

                this.#discord.sendEmbedToLogChannel(context.guildId, embed);
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