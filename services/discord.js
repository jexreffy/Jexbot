'use strict'
const Discord = require('discord.js');

module.exports = class JexBotDiscord {
    #app;
    #discordClient;
    #guilds = {};
    #pingRoles = {};
    #racerRoles = {};
    #raceChannels = {};
    #sotwChannels = {};

    constructor(app) {
        let client = new Discord.Client({fetchAllMembers: true});

        this.#discordClient = client;
        this.#app = app;

        client.on('disconnect', JexBotDiscord.#onDisconnect);
        client.on('error', JexBotDiscord.#onError);
        client.on('reconnecting', JexBotDiscord.#onReconnecting);
        client.on('warn', JexBotDiscord.#onWarning);

        client.on('message', message => {
            this.#app.onDiscordMessageReceived(message);
        });

        client.on('ready', () => {
            const config = app.config;
            const guilds = app.guilds;

            for (let i = 0; i < guilds.length; i++) {
                const guildId = guilds[i];
                const guildConfig = config.guilds[guildId];
                const guild = client.guilds.cache.find(guild => guild.id === guildId);
                this.#guilds[guildId] = guild;

                const channelCache = guild.channels.cache;
                const rolesCache = guild.roles.cache;

                this.#raceChannels[guildId] = channelCache.find(channel => channel.name === guildConfig.channel);
                this.#sotwChannels[guildId] = guildConfig.sotwEnabled ? channelCache.find(channel => channel.name === guildConfig.sotwChannel) : null;
                this.#pingRoles[guildId] = rolesCache.find(role => role.name === guildConfig.pingRole);
                this.#racerRoles[guildId] = rolesCache.find(role => role.name === guildConfig.racerRole);
            }
        });

        client.login(process.env.DISCORD_BOT_TOKEN).then(x => {
            console.log(`${new Date().toLocaleString('en-US')} Discord connected`);
        }).catch(console.error);
    }

    get client() {
        return this.#discordClient;
    }

    findMember(guildId, id) {
        return this.#raceChannels[guildId].members.find(x => x.user.id === id);
    }

    findMessage(guildId, messageId) {
        return this.#raceChannels[guildId].messages.fetch(messageId);
    }

    getChannel(guildId, channelName) {
        return this.#guilds[guildId].channels.cache.find(channel => channel.name === channelName);
    }

    getRaceChannel(guildId) {
        return this.#raceChannels[guildId];
    }

    getSotwChannel(guildId) {
        return this.#sotwChannels[guildId];
    }

    getPingRole(guildId) {
        return this.#pingRoles[guildId];
    }

    getRacerRole(guildId) {
        return this.#racerRoles[guildId];
    }

    sendToRaceChannel(guildId, message) {
        return this.#raceChannels[guildId].send(message);
    }

    sendToSotwChannel(guildId, message) {
        return this.#sotwChannels[guildId].send(message);
    }

    static #onDisconnect(event) {
        console.log(`${new Date().toLocaleString('en-US')} disconnected \n${event.reason}`);
    }

    static #onError(error) {
        console.log(`${new Date().toLocaleString('en-US')} error \n${error.message}`);
    }

    static #onReconnecting() {
        console.log(`${new Date().toLocaleString('en-US')} reconnecting`);
    }

    static #onWarning(warning) {
        console.log(`${new Date().toLocaleString('en-US')} warning: \n${warning}`);
    }
}