const axios = require('axios');
const mysterySettings = require('../common/mysterySettings');
const randomizerSettings = require('../common/randomizerSettings');
const plandoSettings = require('../common/plandoSettings');
const processSeed = require('../common/processSeed');
const updateRaceMessage = require('../common/updateRaceMessage');

const RANDO_URL = 'https://alttpr.com/api/randomizer';
const PLANDO_URL = 'https://alttpr.com/api/customizer';

module.exports = (config, db, race, dChannel, message) => {
    if (race && race.seedLink) return;

    let helpMatch = message.content.match(/^[.!](\broll help\b)/i);

    if (helpMatch && helpMatch.length > 0) {
        let keys = Object.keys(config.categories);
        let message = `**.roll {mode}**\nModes:\n`;

        for (let i = 0; i < keys.length; i++) {
            message += `\n\`${keys[i]}\` - ${config.categories[keys[i]].name}`;
        }

        dChannel.send(message).then().catch(console.error);
        return;
    }

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
        const settings = category.mystery ? mysterySettings(category.weights) : randomizerSettings(config, category);

        const url = category.customizer ? PLANDO_URL : RANDO_URL;

        rollSeed(config, db, race, dChannel, url, settings, username, categoryName);
    }
}

function rollSeed(config, db, race, dChannel, url, settings, username, categoryName) {
    axios.post(url, settings).then(result => {
        let guildId = dChannel.guild.id;
        let seed = processSeed(config, guildId, null, categoryName, result);

        if (race) {
            race.seedRoller = username;
            race.seedLink = seed.link;
            race.seedCode = seed.code;

            updateRaceMessage(db, race, dChannel);
            db.setRaceData(dChannel.guild.id, race);
        }

        dChannel.send(`${seed.link} ${seed.code}`).then().catch(console.error);
    }).catch(console.error);
}