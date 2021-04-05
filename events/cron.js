const axios = require('axios');
const config = require('../config.json');
const data = require('../data/data.js');
const broadcastMessage = require('../common/broadcastMessage');
const broadcastTwitch = require('../common/broadcastTwitch');
const mysterySettings = require('../common/mysterySettings');
const randomizerSettings = require('../common/randomizerSettings');
const processSeed = require('../common/processSeed');

const RANDO_URL = 'https://alttpr.com/api/randomizer';
const PLANDO_URL = 'https://alttpr.com/api/customizer';

module.exports = (dClient, tClient) => {
    const guildId = data.getActiveRace();

    if (guildId) {
        let race = data.getRaceData(guildId);

        if (!race.started || race.finished) return;

        let dChannel = dClient.channels.cache.find(channel => channel.name === config.guilds[guildId].channel);

        if (!race.ladder && config.categories[race.category].gtbk && !race.guessGameStarted && (Math.floor(Date.now() - race.startedAt) / 1000) > config.minimumGuessStartSeconds) {
            race.guessGameStarted = true;
            broadcastMessage(config, dChannel, tClient, config.gtGuessIntro, false);
        } else if (!race.lastHello || (Math.floor(Date.now() - race.lastHello) / 1000) > config.helloInterval) {
            race.lastHello = Date.now();
            broadcastTwitch(config, tClient, race.ladder ? config.helloLadder : config.helloRace);
        }

        data.setRaceData(guildId, race);
    } else {
        let lastTime = data.getLastSotw();
        let now = Date.now();
        if ((Math.floor(now - lastTime) / 604800000) > 1) {
            let keys = Object.keys(config.guilds);
            for (let i = 0; i < keys.length; i++) {
                let guildId = keys[i];
                if (config.guilds[guildId].sotwEnabled) {
                    let easyIndex = data.getEasySotw(guildId);
                    let easyMode = config.guilds[guildId].sotwEasy[easyIndex];
                    easyIndex = easyIndex >= config.guilds[guildId].sotwEasy.length - 1 ? 0 : easyIndex + 1;

                    let mediumIndex = data.getMediumSotw(guildId);
                    let mediumMode = config.guilds[guildId].sotwMedium[mediumIndex];
                    mediumIndex = mediumIndex >= config.guilds[guildId].sotwMedium.length - 1 ? 0 : mediumIndex + 1;

                    let hardIndex = data.getHardSotw(guildId);
                    let hardMode = config.guilds[guildId].sotwHard[hardIndex];
                    hardIndex = hardIndex >= config.guilds[guildId].sotwHard.length - 1 ? 0 : hardIndex + 1;

                    data.setSotw(guildId, easyIndex, mediumIndex, hardIndex, now);
                    rollSeeds(guildId, dClient, easyMode, mediumMode, hardMode);
                }
            }
        }
    }
};

function rollSeeds(guildId, dClient, easyMode, mediumMode, hardMode) {
    const easyCategory = config.categories[easyMode];
    const easySettings = easyMode === "mystery" ? mysterySettings(config.mysteryWeights) : randomizerSettings(config, easyCategory);
    const easyUrl      = easyCategory.customizer ? PLANDO_URL : RANDO_URL;

    const mediumCategory = config.categories[mediumMode];
    const mediumSettings = mediumMode === "mystery" ? mysterySettings(config.mysteryWeights) : randomizerSettings(config, mediumCategory);
    const mediumUrl      = mediumCategory.customizer ? PLANDO_URL : RANDO_URL;

    const hardCategory = config.categories[hardMode];
    const hardSettings = hardMode === "mystery" ? mysterySettings(config.mysteryWeights) : randomizerSettings(config, hardCategory);
    const hardUrl      = hardCategory.customizer ? PLANDO_URL : RANDO_URL;

    let seeds = [];

    axios.post(easyUrl, easySettings).then(easyResult => {
        seeds.push(processSeed(guildId, easyCategory.name, easyResult));

        axios.post(mediumUrl, mediumSettings).then(mediumResult => {
            seeds.push(processSeed(guildId, mediumCategory.name, mediumResult));

            axios.post(hardUrl, hardSettings).then(hardResult => {
                seeds.push(processSeed(guildId, hardCategory.name, hardResult));

                let dChannel = dClient.channels.cache.find(channel => channel.name === config.guilds[guildId].sotwChannel);
                let role = dChannel.guild.roles.cache.find(r => r.name === config.guilds[guildId].pingRole);

                let message = `${role} Seeds of the week, courtesy of JexBot`;

                for (let i = 0; i < seeds.length; i++) {
                    message += `\n${seeds[i].name} ${seeds[i].link} ${seeds[i].code}`;
                }

                dChannel.send(message).then().catch(console.error);
            }).catch(console.error);
        }).catch(console.error);
    }).catch(console.error);
}