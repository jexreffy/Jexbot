"use strict"
const Discord = require('discord.js');
const fs = require('fs');

let clientKey = Symbol();

module.exports = class JexDiscord {
    constructor() {
        this[clientKey] = new Discord.Client({fetchAllMembers: true});

        fs.readdir('./events/', (err, files) => {
            files.forEach(file => {
                const eventHandler = require(`./events/${file}`);
                const eventName = file.split('.')[0];

                if (eventName !== 'cron') {
                    dClient.on(eventName, (message) => {
                        eventHandler(db, dClient, tClient, message);
                    });
                }
            });
        });

        this[clientKey].login(process.env.DISCORD_BOT_TOKEN).then(x => {
            let time = new Date();
            console.log(time.toLocaleString('en-US') + ' Discord connected');
        }).catch(console.error);
    }

    get client() {
        return this[clientKey];
    }
}