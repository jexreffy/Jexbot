const axios = require('axios');
const config = require('../config.json');
const broadcastMessage = require('../common/broadcastMessage');
const broadcastTwitch = require('../common/broadcastTwitch');
const categorySettings = require('../common/categorySettings');
const processSeed = require('../common/processSeed');

module.exports = (db, dClient, tClient) => {
    const guildId = db.getActiveRace();

    if (guildId) {
        let race = db.getRaceData(guildId);

        if (!race.started || race.finished) return;

        let dChannel = dClient.channels.cache.find(channel => channel.name === config.guilds[guildId].channel);

        if (!race.ladder && !race.invitational && config.categories[race.category].gtbk && !race.guessGameStarted && (Math.floor(Date.now() - race.startedAt) / 1000) > config.minimumGuessStartSeconds) {
            race.guessGameStarted = true;
            broadcastMessage(config, dChannel, tClient, config.gtGuessIntro, false);
        } else if (!race.lastHello || (Math.floor(Date.now() - race.lastHello) / 1000) > config.helloInterval) {
            race.lastHello = Date.now();
            broadcastTwitch(config, tClient, race.ladder ? config.helloLadder : race.invitational ? config.helloInvitational : config.helloRace);
        }

        db.setRaceData(guildId, race);
    } else {
        let lastTime = db.getLastSotw();
        let now = new Date();
        if ((Math.floor(now.getTime() - lastTime) / 604800000) > 1) {
            let keys = Object.keys(config.guilds);
            for (let i = 0; i < keys.length; i++) {
                let guildId = keys[i];
                if (config.guilds[guildId].sotwEnabled) {
                    let easyIndex = db.getEasySotw(guildId);
                    let easyMode = config.guilds[guildId].sotwEasy[easyIndex];
                    easyIndex = easyIndex >= config.guilds[guildId].sotwEasy.length - 1 ? 0 : easyIndex + 1;

                    let mediumIndex = db.getMediumSotw(guildId);
                    let mediumMode = config.guilds[guildId].sotwMedium[mediumIndex];
                    mediumIndex = mediumIndex >= config.guilds[guildId].sotwMedium.length - 1 ? 0 : mediumIndex + 1;

                    let hardIndex = db.getHardSotw(guildId);
                    let hardMode = config.guilds[guildId].sotwHard[hardIndex];
                    hardIndex = hardIndex >= config.guilds[guildId].sotwHard.length - 1 ? 0 : hardIndex + 1;

                    db.setSotwNext(guildId, easyIndex, mediumIndex, hardIndex, new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0).valueOf());

                    rollSeeds(guildId, db, dClient, categorySettings(config, easyMode), categorySettings(config, mediumMode), categorySettings(config, hardMode));
                }
            }
        }
    }
};

function rollSeeds(guildId, db, dClient, easySettings, mediumSettings, hardSettings) {
    let seeds = [];

    axios.post(easySettings.url, easySettings.settings).then(easyResult => {
        seeds.push(processSeed(config, guildId, easySettings.name, easySettings.title, easyResult));

        axios.post(mediumSettings.url, mediumSettings.settings).then(mediumResult => {
            seeds.push(processSeed(config, guildId, mediumSettings.name, mediumSettings.title, mediumResult));

            axios.post(hardSettings.url, hardSettings.settings).then(hardResult => {
                seeds.push(processSeed(config, guildId, hardSettings.name, hardSettings.title, hardResult));

                let dChannel = dClient.channels.cache.find(channel => channel.name === config.guilds[guildId].sotwChannel);
                let role = dChannel.guild.roles.cache.find(r => r.name === config.guilds[guildId].pingRole);

                let message = `${role} ${config.sotwMessage} ${config.sotwSponsor[Math.floor(Math.random() * config.sotwSponsor.length)]}`;

                for (let i = 0; i < seeds.length; i++) {
                    message += `\n${seeds[i].name} ${seeds[i].link} ${seeds[i].code}`;
                }

                dChannel.send(message).then().catch(console.error);

                db.setSotwSeeds(guildId, seeds[0], seeds[1], seeds[2]);
            }).catch(console.error);
        }).catch(console.error);
    }).catch(console.error);
}