'use strict'

module.exports = class MockDiscord {
    #app;
    #raceChannelMessages = [];
    #sotwChannelMessages = [];

    constructor(app) {
        this.#app = app;
    }

    get raceChannelMessages() {
        return this.#raceChannelMessages;
    }

    get sotwChannelMessages() {
        return this.#sotwChannelMessages;
    }

    findMember(guildId, username) {
        return `member${guildId}${username}`;
    }

    findMessage(guildId, messageId) {
        return `message${guildId}${messageId}`;
    }

    getPingRole(guildId) {
        return `ping${guildId}`;
    }

    getRacerRole(guildId) {
        return `racer${guildId}`;
    }

    sendToRaceChannel(guildId, message) {
        return new Promise((resolve, reject) => {
            let retVal = {
                id: this.#raceChannelMessages.length
            };

            this.#raceChannelMessages.push(message);

            resolve(retVal);
        });
    }

    sendToSotwChannel(guildId, message) {
        return new Promise((resolve, reject) => {
            let retVal = {
                id: this.#sotwChannelMessages.length
            };

            this.#sotwChannelMessages.push(message);

            resolve(retVal);
        });
    }
}