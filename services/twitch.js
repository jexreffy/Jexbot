'use strict'
const Twitch = require('tmi.js');

module.exports = class JexBotTwitch {
    #app;
    #clients = {};
    #guilds = [];

    constructor(app) {
        this.#app = app;

        const guilds = app.guilds;

        for (let i = 0; i < guilds.length; i++) {
            this.#clients[guilds[i]] = null;
            this.#guilds.push(guilds[i]);
        }
    }

    getChannelsForGuild(guildId) {
        return this.#clients[guildId].channels;
    }

    getGuildForChannel(channel) {
        for (let i = 0; i < this.#guilds.length; i++) {
            let guildId = this.#guilds[i];
            if (this.#clients[guildId].channels.indexOf(channel) >= 0) {
                return guildId;
            }
        }

        return null;
    }

    isConnectedToTwitch(guildId) {
        return this.#clients[guildId] !== null;
    }

    connectToTwitch(guildId) {
        let channels = [];

        const config = this.#app.config;
        let race = this.#app.db.getRaceData(guildId);

        if (race.ladder) {
            channels.push(config['botOwnerTwitch']);
        } else {
            if (race.invitational && race.restream) {
                channels.push(race.restream);
            } else if (!race.invitational) {
                if (race.restream) channels.push(race.restream);

                for (let i = 0; i < race.players.length; i++) {
                    if (this.#app.db.getPlayerTwitchBot(race.players[i].username)) {
                        channels.push(race.players[i].twitch);
                    }
                }
            }
        }

        if (channels.length <= 0) return;

        this.#clients[guildId] = new Twitch.Client({
            identity: {
                username: process.env.TWITCH_BOT_NAME,
                password: process.env.TWITCH_BOT_TOKEN
            },
            channels: channels
        });

        this.#clients[guildId].on('message', (channel, tags, message, self) => {
            this.#app.onTwitchMessageReceived(channel, tags, message, self);
        });

        this.#clients[guildId].connect().then(x => {
            console.log(`${new Date().toLocaleString('en-US')} Twitch connected`);
        }).catch(console.error);
    }

    disconnectFromTwitch(guildId) {
        this.#clients[guildId].disconnect().then(x => {
            console.log(`${new Date().toLocaleString('en-US')} Twitch disconnected`);
            this.#clients[guildId] = null;
        }).catch(console.error);
    }

    sendToTwitchChannel(guildId, channel, message) {
        return new Promise((resolve, reject) => {
            this.#clients[guildId].say(channel, message);
            resolve();
        });
    }
}