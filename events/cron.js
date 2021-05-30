const axios = require('axios');
const config = require('../config.json');
const broadcastMessage = require('../common/broadcastMessage');
const broadcastTwitch = require('../common/broadcastTwitch');
const categorySettings = require('../common/categorySettings');
const getRandom = require('../common/getRandom');
const processSeed = require('../common/processSeed');

module.exports = (db, dClient, tClient) => {
    const guildId = db.getActiveRace();

    if (guildId) {
        let race = db.getRaceData(guildId);

        if (!race.started || race.finished) return;

        let now = Date.now();

        let dChannel = dClient.channels.cache.find(channel => channel.name === config.guilds[guildId].channel);

        if (race.teams && race.relay) {
            for (let i = 0; i < race.legStartTime.length; i++) {
                let startTime = race.legStartTime[i];
                if (startTime > 0 && startTime - now <= config.relayLegDelaySeconds * 500) {
                    let hasFinished = race.players.filter(x => x.team === i && x.finished);
                    let nextPlayer = race.players.find(x => x.team === i && x.leg === hasFinished.length);
                    countdownNextPlayer(dChannel, nextPlayer, startTime - now, config.relayLegDelaySeconds / 2);
                    race.legStartTime[i] = 0;
                }
            }
        }

        if (!(race.ladder || race.invitational) && config.categories[race.category].gtbk && !race.guessGameStarted && (Math.floor(now - race.startedAt) / 1000) > config.minimumGuessStartSeconds) {
            race.guessGameStarted = true;
            broadcastMessage(config, dChannel, tClient, config.gtGuessIntro, false);
        } else if (!race.lastHello || (Math.floor(now - race.lastHello) / 1000) > config.helloInterval) {
            race.lastHello = now;
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

                let message = `${role} ${config.sotwMessage} ${config.sotwSponsor[getRandom(config.sotwSponsor.length)]}`;

                for (let i = 0; i < seeds.length; i++) {
                    message += `\n${seeds[i].name} ${seeds[i].link} ${seeds[i].code}`;
                }

                dChannel.send(message).then().catch(console.error);

                db.setSotwSeeds(guildId, seeds[0], seeds[1], seeds[2]);
            }).catch(console.error);
        }).catch(console.error);
    }).catch(console.error);
}

function countdownNextPlayer(dChannel, nextPlayer, remainingTime, delayTime) {
    const sleep = m => new Promise(r => setTimeout(r, m));
    (async() => {
        let nextMember = dChannel.members.find(x => x.user.username === nextPlayer.username);
        dChannel.send(`${nextPlayer.username} Your leg of the relay will start in ${delayTime / 60} minutes.`).then().catch(console.error);
        let oneMinuteLeft = remainingTime - 60000;
        await sleep(oneMinuteLeft);

        dChannel.send(`<@${nextMember.id}> Your leg of the relay will start in 60 seconds.`);
        await sleep(30000);

        dChannel.send(`${nextPlayer.username} Your leg of the relay will start in 30 seconds.`);
        await sleep(20000);

        dChannel.send(`${nextPlayer.username} Your leg of the relay will start in 10 seconds.`);
        await sleep(5000);


        for (let i = 5; i > 0; i--) {
            dChannel.send(`**${nextPlayer.username} ${i}**`).then().catch(console.error);
            await sleep(1000);
        }

        dChannel.send(`**${nextPlayer.username} GO!!!**`).then().catch(console.error);
    })();
}