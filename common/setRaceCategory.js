module.exports = (config, db, race, guildId, selectedCategory) => {
    if (selectedCategory === "sotweasy" || selectedCategory === "sotwmedium" || selectedCategory === "sotwhard") {
        let seed = db.getSotwSeed(guildId, selectedCategory);

        race.category = seed.category;
        race.categoryName = seed.name;
        race.categoryDescription = db.getCategory(seed.category).description;
        race.seedLink = seed.link;
        race.seedCode = seed.code;
        race.seedRoller = "JexBot";

    } else {
        let categoryKey = config.defaultCategory;
        let categories = db.getCategories();

        for (let i = 0; i < categories.length; i++) {
            if (selectedCategory === categories[i]) {
                categoryKey = categories[i];
                break;
            }
        }

        let category = db.getCategory(categoryKey);

        race.categoryToRoll = categoryKey;
        race.category = category.category;
        race.categoryName = category.name;
        race.categoryDescription = category.description;
        race.guessGameEnabled = category.gtbk;
    }
}