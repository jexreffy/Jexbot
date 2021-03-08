const axios = require('axios');
const data = require('../data/data.js');
const mysterySettings = require('../common/mysterySettings');
const randomizerSettings = require('../common/randomizerSettings');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, race, dChannel, message) => {
    if (race && race.seedLink) return;

    let categoryName = config.defaultCategory;

    if (race) {
        dChannel.send(`**${message} has sealed their fate. I'd pray to RN Jesus while the seed is rolling if I were you...**`).then().catch(console.error);
        categoryName = race.category;
    } else {
        let match = message.content.match(/^[.!](\broll\b) ([a-zA-Z0-9<>:]{4,20})/i);

        if (match && match.length > 2) {
            let categories = Object.keys(config.categories);

            for (let i = 0; i < categories.length; i++) {
                if (match[2] === categories[i]) {
                    categoryName = categories[i];
                    dChannel.send(`**Generating ${categories[i].name} seed...**`).then().catch(console.error);
                    break;
                }
            }
        }
    }

    const category = config.categories[categoryName];
    const settings = categoryName === "mystery" ? mysterySettings(config.mysteryWeights) : randomizerSettings(config, category);

    const url = category.customizer ? 'https://alttpr.com/api/customizer' : 'https://alttpr.com/api/randomizer';
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
            race.seedRoller = message;
            race.seedLink = link;
            race.seedCode = code;

            updateRaceMessage(race, dChannel);
            data.setRaceData(dChannel.guild.id, race);
        }

        dChannel.send(`${link} ${code}`).then().catch(console.error);
    }).catch(console.error);
}