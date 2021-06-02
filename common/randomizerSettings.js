const getRandom = require('../common/getRandom');
const getCustomizerSettings = require('../common/getCustomizerSettings');
const getRandomizerSettings = require('../common/getRandomizerSettings');
const processStartingEquipment = require('../common/processStartingEquipment');

module.exports = (config, category) => {
    let settings = category.customizer ? getCustomizerSettings() : getRandomizerSettings();

    let keys = Object.keys(category.settings);

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];

        if (key === "eq") {
            processStartingEquipment(settings, category.settings['eq']);
        } else if (typeof category.settings[key] === 'object' && category.settings[key] !== null) {
            let subkeys = Object.keys(category.settings[key]);

            for (let i = 0; i < subkeys.length; i++) {
                let subkey = subkeys[i];
                if (key === "custom" && subkey === "jex.GTBKinGT") {
                    let location = config.gtbkLocations[getRandom(config.gtbkLocations.length)];
                    settings.l[location] = "BigKeyA2:1"
                    settings.custom.item.count.BigKeyA2 = 0;
                } else if (key === "custom" && subkey === "jex.uncleItem") {
                    let location = config.uncleLocation;
                    let item = category.settings[key][subkey];
                    settings.l[location] = item;
                    settings.custom.item.count[item]--;
                } else {
                    settings[key][subkey] = category.settings[key][subkey];
                }
            }
        } else {
            settings[key] = category.settings[key];
        }
    }

    return settings;
}