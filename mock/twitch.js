'use strict'

module.exports = class MockTwitch {
    #app;
    #channels = {};
    #connected = {};
    #messages = {};

    constructor(app) {
        this.#app = app;

        const guilds = app.guilds;

        for (let i = 0; i < guilds.length; i++) {
            this.#channels[guilds[i]] = [];
            this.#connected[guilds[i]] = false;
            this.#messages[guilds[i]] = [];
        }
    }

    get connected() {
        return this.#connected;
    }

    get messages() {
        return this.#messages;
    }

    getChannelsForGuild(guildId) {
        return this.#channels[guildId];
    }

    isConnectedToTwitch(guildId) {
        return this.#connected[guildId];
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

        this.#channels[guildId] = channels;
        this.#connected[guildId] = true;
    }

    disconnectFromTwitch(guildId) {
        this.#connected[guildId] = false;
    }

    sendToTwitchChannel(guildId, channel, message) {
        if (!this.#messages[guildId]) {
            this.#messages[guildId] = [];
        }

        this.#messages[guildId].push(`message${channel}${message}`);
    }
}