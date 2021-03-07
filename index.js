require('dotenv').config();
const config = require('./config.json');
const fs = require('fs');

const Discord = require('discord.js');
const dClient = new Discord.Client();

const Twitch = require('tmi.js');
let tClient = null;

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function connectToTwitch() {
    const data = require('./data/data.js');

    const guildId = data.getActiveRace();

    if (!guildId) return;

    let race = data.getRaceData(guildId);

    if (!race.started || race.finished) return;

    let channels = [];

    if (race.ladder) {
        channels.push(config.botOwnerTwitch);
    } else {
        for (let i = 0; i < race.players.length; i++) {
            if (data.getPlayerTwitchBot(race.players[i].username)) {
                channels.push(race.players[i].twitch);
            }
        }
    }

    if (channels.length <= 0) return;

    tClient = new Twitch.Client({
        identity: {
            username: process.env.TWITCH_BOT_NAME,
            password: process.env.TWITCH_BOT_TOKEN
        },
        channels: channels
    });

    fs.readdir('./events/', (err, files) => {
        files.forEach(file => {
            const eventHandler = require(`./events/${file}`);
            const eventName = file.split('.')[0];

            if (eventName === 'message') {
                tClient.on(eventName, (channel, tags, message, self) => {
                    eventHandler(dClient, tClient, channel, tags, message, self);
                });
            }
        });
    });

    tClient.connect().then(x => {
        let time = new Date();
        console.log(time.toLocaleString('en-US') + ' Twitch connected');
    }).catch(console.error);
}

fs.readdir('./events/', (err, files) => {
    files.forEach(file => {
        const eventHandler = require(`./events/${file}`);
        const eventName = file.split('.')[0];

        if (eventName !== 'cron') {
            dClient.on(eventName, (message) => {
                eventHandler(dClient, tClient, message);
            });
        }
    });
});

dClient.login(process.env.DISCORD_BOT_TOKEN).then(x => {
    let time = new Date();
    console.log(time.toLocaleString('en-US') + ' Discord connected');
}).catch(console.error);

const cron = require('node-cron');
cron.schedule('*/5 * * * * *', () => {
    if (!tClient) {
        connectToTwitch();
    } else {
        const cron = require('./events/cron');
        cron(dClient, tClient);
    }
}, {});