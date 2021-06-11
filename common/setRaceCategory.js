'use strict'
module.exports = (app, context, selectedCategory) => {
    if (selectedCategory === 'sotweasy' ||
        selectedCategory === 'sotwmedium' ||
        selectedCategory === 'sotwhard') {
        let seed = app.db.getSotwSeed(context.guildId, selectedCategory);

        context.activeRace.category = seed.category;
        context.activeRace.categoryName = seed.name;
        context.activeRace.categoryDescription = db.getCategory(seed.category).description;
        context.activeRace.seedLink = seed.link;
        context.activeRace.seedCode = seed.code;
        context.activeRace.seedRoller = 'JexBot';

    } else {
        let categoryKey = app.config['defaultCategory'];
        let categories = app.db.getCategories();

        for (let i = 0; i < categories.length; i++) {
            if (selectedCategory === categories[i]) {
                categoryKey = categories[i];
                break;
            }
        }

        let category = app.db.getCategory(categoryKey);

        context.activeRace.categoryToRoll = categoryKey;
        context.activeRace.category = category.category;
        context.activeRace.categoryName = category.name;
        context.activeRace.categoryDescription = category.description;
        context.activeRace.guessGameEnabled = category.gtbk;
    }
}