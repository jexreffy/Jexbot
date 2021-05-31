const getRandom = require('../common/getRandom');
const mysterySettings = require('../common/mysterySettings');
const randomizerSettings = require('../common/randomizerSettings');

const RANDO_URL = 'https://alttpr.com/api/randomizer';
const PLANDO_URL = 'https://alttpr.com/api/customizer';

module.exports = (config, categoryName) => {
    let category = config.categories[categoryName];

    let retVal = {
        name: categoryName,
        title: category.name,
        description: category.description,
    };

    if (category.mystery) {
        retVal.settings = mysterySettings(category.weights);
    } else if (category.random) {
        let categoryList = category.categories.length > 0 ? category.categories : Object.keys(config.categories);
        do {
            category = config.categories[categoryList[getRandom(categoryList.length)]];
        } while (category.mystery);

        retVal.settings = randomizerSettings(config, category);
        retVal.settings.spoilers = "mystery";
    } else {
        retVal.settings = randomizerSettings(config, category);
        retVal.settings.notes = `${retVal.title}: ${retVal.description}`;
    }

    retVal.url = category.customizer ? PLANDO_URL : RANDO_URL;

    return retVal;
}