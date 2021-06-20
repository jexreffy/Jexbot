'use strict'

module.exports = class MockDiscord {
    #app;
    #raceChannelMessages = {};
    #sotwChannelMessages = {};

    constructor(app) {
        this.#app = app;

        const guilds = app.guilds;

        for (let i = 0; i < guilds.length; i++) {
            this.#raceChannelMessages[guilds[i]] = [];
            this.#sotwChannelMessages[guilds[i]] = [];
        }
    }

    findMember(guildId, username) {
        return `member${guildId}${username}`;
    }

    findMessage(guildId, messageId) {
        return new Promise((resolve, reject) => {
            resolve(this.#raceChannelMessages[guildId][messageId]);
        });
    }

    getPingRole(guildId) {
        return `ping${guildId}`;
    }

    getRacerRole(guildId) {
        return `racer${guildId}`;
    }

    getRaceChannelMessages(guildId) {
        return this.#raceChannelMessages[guildId];
    }

    getSotwChannelMessages(guildId) {
        return this.#sotwChannelMessages[guildId];
    }

    sendToRaceChannel(guildId, message) {
        return new Promise((resolve, reject) => {
            let retVal = {
                id: this.#raceChannelMessages[guildId].length
            };

            let newMessage = {
                id: retVal.id,
                message: message,
                edit: function(x) {
                    return new Promise((resolve, reject) => {
                        this.message = x;
                        resolve();
                    });
                }
            }

            this.#raceChannelMessages[guildId].push(newMessage);

            resolve(retVal);
        });
    }

    sendToSotwChannel(guildId, message) {
        return new Promise((resolve, reject) => {
            let retVal = {
                id: this.#sotwChannelMessages[guildId].length
            };

            let newMessage = {
                id: retVal.id,
                message: message,
                edit: function(x) {
                    return new Promise((resolve, reject) => {
                        this.message = x;
                        resolve();
                    });
                }
            }

            this.#sotwChannelMessages[guildId].push(newMessage);

            resolve(retVal);
        });
    }
}