'use strict'
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, IntentsBitField } = require('discord.js');

module.exports = class JexBotDiscord {
    #app;
    #discordClient;
    #guilds = {};
    #pingRoles = {};
    #racerRoles = {};
    #raceChannels = {};
    #logChannels = {};
    #sotwChannels = {};

    constructor(app) {
        const myIntents = new IntentsBitField();
        myIntents.add(IntentsBitField.Flags.Guilds,
                        IntentsBitField.Flags.GuildMembers,
                        IntentsBitField.Flags.GuildMessages,
                        IntentsBitField.Flags.MessageContent);

        let client = new Client({ intents: myIntents });

        this.#discordClient = client;
        this.#app = app;

        client.on(Events.Error, JexBotDiscord.#onError);
        client.on(Events.Warn, JexBotDiscord.#onWarning);

        client.on(Events.MessageCreate, async interaction => {
            this.#app.onDiscordMessageReceived(interaction);
        });

        client.once(Events.ClientReady, () => {
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
                this.#logChannels[guildId] = channelCache.find(channel => channel.name === guildConfig.logChannel);
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

    findMemberById(guildId, id) {
        return this.#guilds[guildId].members.cache.find(x => x.user.id === id);
    }

    findMemberByUsername(guildId, username) {
        return this.#guilds[guildId].members.cache.find(x => x.user.username === username)
    }

    findMessage(guildId, messageId) {
        return this.#raceChannels[guildId].messages.fetch(messageId);
    }

    getChannelById(guildId, channelId) {
        return this.#guilds[guildId].channels.cache.find(channel => channel.id === channelId);
    }

    getChannelByName(guildId, channelName) {
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

    sendEmbedToRaceChannel(guildId, embed) {
        return this.#raceChannels[guildId].send({embeds: [embed]});
    }

    sendToLogChannel(guildId, message) {
        return this.#logChannels[guildId].send(message);
    }

    sendEmbedToLogChannel(guildId, embed) {
        return this.#logChannels[guildId].send({embeds: [embed]});
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