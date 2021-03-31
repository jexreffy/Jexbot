const axios = require('axios');
const data = require('../data/data.js');
const mysterySettings = require('../common/mysterySettings');
const randomizerSettings = require('../common/randomizerSettings');
const plandoSettings = require('../common/plandoSettings');
const updateRaceMessage = require('../common/updateRaceMessage');

const RANDO_URL = 'https://alttpr.com/api/randomizer';
const PLANDO_URL = 'https://alttpr.com/api/customizer';

module.exports = (config, race, dChannel, message) => {
    if (race && race.seedLink) return;

    let categoryName = config.defaultCategory;
    let username = message.author.username;

    if (message.attachments && message.attachments.size > 0) {
        /*let attachment = message.attachments.first();
        axios.get(attachment.url).then(result => {
            if (race) {
                dChannel.send(`**I could tell you the nonsense that ${username} has in this Plando, but where's the fun in that...**`).then().catch(console.error);
            }

            rollSeed(config, race, dChannel, PLANDO_URL, plandoSettings(result), username);
        }).catch(console.error);*/
    } else {
        if (race) {
            dChannel.send(`**${username} has sealed their fate. I'd pray to RN Jesus while the seed is rolling if I were you...**`).then().catch(console.error);
            categoryName = race.category;
        } else {
            let match = message.content.match(/^[.!](\broll\b) ([a-zA-Z0-9<>:]{4,20})/i);

            if (match && match.length > 2) {
                let categories = Object.keys(config.categories);

                for (let i = 0; i < categories.length; i++) {
                    if (match[2] === categories[i]) {
                        categoryName = categories[i];
                        break;
                    }
                }
            }

            dChannel.send(`**Generating ${config.categories[categoryName].name} seed...**`).then().catch(console.error);
        }

        const category = config.categories[categoryName];
        const settings = categoryName === "mystery" ? mysterySettings(config.mysteryWeights) : randomizerSettings(config, category);

        const url = category.customizer ? PLANDO_URL : RANDO_URL;

        rollSeed(config, race, dChannel, url, settings, username);
    }
}

function rollSeed(config, race, dChannel, url, settings, username) {
    axios.post(url, settings).then(result => {
        let link = `<https://alttpr.com/h/${result.data.hash}>`;
        let code = ``;

        for (let p = 0; p < result.data.patch.length; p++) {
            let startAt = parseInt(config.codeStartAt)

            let key = parseInt(Object.keys(result.data.patch[p])[0]);

            if (startAt > key) continue;

            let data = null;
            if (startAt < key) {
                key = parseInt(Object.keys(result.data.patch[p - 1])[0]);
                data = result.data.patch[p - 1][`${key}`];
            } else {
                data = result.data.patch[p][`${key}`];
            }

            let offset = startAt - key;

            for (let c = 0; c < 5; c++) {
                code += `<${config.guilds[dChannel.guild.id].codeMap[data[c + offset]]}>${c < 4 ? ' ' : ''}`
            }

            break;
        }

        if (race) {
            race.seedRoller = username;
            race.seedLink = link;
            race.seedCode = code;

            updateRaceMessage(race, dChannel);
            data.setRaceData(dChannel.guild.id, race);
        }

        dChannel.send(`${link} ${code}`).then().catch(console.error);
    }).catch(console.error);
}