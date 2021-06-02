const getRandom = require('../common/getRandom');
const mysterySettings = require('../common/mysterySettings');
const randomizerSettings = require('../common/randomizerSettings');

const RANDO_URL = 'https://alttpr.com/api/randomizer';
const PLANDO_URL = 'https://alttpr.com/api/customizer';

module.exports = (config, db, categoryName) => {
    let category = db.getCategory(categoryName);

    let retVal = {
        name: categoryName,
        title: category.name,
        description: category.description,
        gtbk: category.gtbk
    };

    if (category.mystery) {
        retVal.settings = mysterySettings(category.weights);
    } else if (category.random) {
        let categoryList = category.categories.length > 0 ? category.categories : db.getCategories();
        do {
            category = db.getCategory(categoryList[getRandom(categoryList.length)]);
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