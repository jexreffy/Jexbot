'use strict'
module.exports = (app, categoryName) => {
    let category = app.db.getCategory(categoryName);

    let retVal = {
        name: categoryName,
        title: category.name,
        description: category.description,
        gtbk: category.gtbk
    };

    if (category.mystery) {
        retVal.settings = app.routines['mysterySettings'](app, category.weights);
    } else if (category.random) {
        let categoryList = category.categories.length > 0 ? category.categories : app.db.getCategories();
        do {
            category = app.db.getCategory(categoryList[app.routines['getRandom'](categoryList.length)]);
        } while (category.mystery);

        retVal.settings = app.routines['randomizerSettings'](app, category);
        retVal.settings.spoilers = "mystery";
    } else {
        retVal.settings = app.routines['randomizerSettings'](app, category);
        retVal.settings.name = `${retVal.title}`;
        retVal.settings.notes = `${retVal.title}: ${retVal.description}`;
    }

    retVal.url = category.customizer ? 'https://alttpr.com/api/customizer' : 'https://alttpr.com/api/randomizer';

    return retVal;
}