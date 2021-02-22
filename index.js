require('dotenv').config();
const config = require('./config.json');
const fs = require('fs');

const Discord = require('discord.js');
const dClient = new Discord.Client();

const Twitch = require('tmi.js');
const tClient = new Twitch.Client({
    identity: {
        username: process.env.TWITCH_BOT_NAME,
        password: process.env.TWITCH_BOT_TOKEN
    },
    channels: config.twitchChannels
});

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

fs.readdir('./events/', (err, files) => {
    files.forEach(file => {
        const eventHandler = require(`./events/${file}`);
        const eventName = file.split('.')[0];

        if (eventName !== 'cron') {
            dClient.on(eventName, (message) => {
                eventHandler(dClient, tClient, message);
            });

            if (eventName === 'message') {
                tClient.on(eventName, (channel, tags, message, self) => {
                    eventHandler(dClient, tClient, channel, tags, message, self);
                });
            }
        }
    });
});

dClient.login(process.env.DISCORD_BOT_TOKEN).then(x => {
    let time = new Date();
    console.log(time.toLocaleString('en-US') + ' Discord connected');
}).catch(console.error);

tClient.connect().then(x => {
    let time = new Date();
    console.log(time.toLocaleString('en-US') + ' Twitch connected');
}).catch(console.error);

const cron = require('node-cron');
cron.schedule('* * * * *', () => {
    const cron = require('./events/cron');
    cron(dClient, tClient);
}, {});