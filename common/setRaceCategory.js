module.exports = (config, db, race, guildId, mode) => {
    if (mode === "sotweasy" || mode === "sotwmedium" || mode === "sotwhard") {
        let seed = db.getSotwSeed(guildId, mode);

        race.category = seed.category;
        race.categoryName = seed.name;
        race.seedLink = seed.link;
        race.seedCode = seed.code;
        race.seedRoller = "JexBot";

    } else {
        let category = config.defaultCategory;
        let categories = Object.keys(config.categories);

        for (let i = 0; i < categories.length; i++) {
            if (mode === categories[i]) {
                category = categories[i];
                break;
            }
        }

        race.category = category;
        race.categoryName = config.categories[category].name;
    }
}