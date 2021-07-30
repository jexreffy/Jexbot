'use strict'
module.exports = (app, category) => {
    let settings = app.routines[category.customizer ? 'getCustomizerSettings' : 'getRandomizerSettings']();

    let keys = Object.keys(category.settings);

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];

        if (key === 'eq') {
            app.routines['processStartingEquipment'](settings, category.settings['eq']);
        } else if (typeof category.settings[key] === 'object' && category.settings[key] !== null) {
            let subkeys = Object.keys(category.settings[key]);

            for (let i = 0; i < subkeys.length; i++) {
                let subkey = subkeys[i];
                if (key === 'custom' && subkey.startsWith('itemCount.')) {
                    let item = subkey.split('.')[1];
                    settings.custom.item.count[item] = category.settings[key][subkey];
                } else if (key === 'custom' && subkey.startsWith('dropCount.')) {
                    let item = subkey.split('.')[1];
                    settings.custom.drop.count[item] = category.settings[key][subkey];
                } else if (key === 'custom' && subkey === 'jex.GTBKinGT') {
                    let locationIndex = app.routines['getRandom'](app.config['gtbkLocations'].length)
                    let location = app.config['gtbkLocations'][locationIndex];
                    settings.l[location] = 'BigKeyA2:1'
                    settings.custom.item.count.BigKeyA2 = 0;
                } else if (key === 'custom' && subkey === 'jex.uncleItem') {
                    let location = app.config['uncleLocation'];
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