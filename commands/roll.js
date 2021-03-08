const axios = require('axios');
const data = require('../data/data.js');
const mysterySettings = require('../common/mysteryRandomizer');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, race, dChannel, username) => {
    if (race.seedLink) return;

    dChannel.send(`**${username} has sealed their fate. I'd pray to RN Jesus while the seed is rolling if I were you...**`).then().catch(console.error);

    const category = config.categories[race.category];
    const settings = race.category === "mystery" ? mysterySettings(config.mysteryWeights) : category.settings;

    const url = category.customizer ? 'https://alttpr.com/api/customizer' : 'https://alttpr.com/api/randomizer';
    axios.post(url, settings).then(result => {
        race.seedRoller = username;
        race.seedLink = `<https://alttpr.com/h/${result.data.hash}>`;

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

            race.seedCode = "";
            for (let c = 0; c < 5; c++) {
                race.seedCode += `<${config.guilds[dChannel.guild.id].codeMap[data[c + offset]]}>${c < 4 ? ' ' : ''}`
            }

            break;
        }

        updateRaceMessage(race, dChannel);
        data.setRaceData(dChannel.guild.id, race);
        dChannel.send(`${race.seedLink} ${race.seedCode}`).then().catch(console.error);
    }).catch(console.error);
}