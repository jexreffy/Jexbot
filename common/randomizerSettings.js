module.exports = (config, category) => {
    let settings = require(category.customizer ? '../data/customizer.json' : '../data/randomizer.json');

    let keys = Object.keys(category.settings);

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];

        if (typeof category.settings[key] === 'object' && category.settings[key] !== null) {
            let subkeys = Object.keys(category.settings[key]);

            for (let i = 0; i < subkeys.length; i++) {
                let subkey = subkeys[i];
                if (key === "custom" && subkey === "jex.GTBKinGT") {
                    let location = config.gtbkLocations[Math.floor(Math.random() * Math.floor(config.gtbkLocations.length))];
                    settings.l[location] = "BigKeyA2:1"
                    settings.custom.item.count.BigKeyA2 = 0;
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