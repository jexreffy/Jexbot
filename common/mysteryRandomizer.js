module.exports = (weights) => {
    let settings = defaultSettings();

    settings.glitches = determineSetting(weights["glitches_required"]);
    settings.item_placement = determineSetting(weights["item_placement"]);
    settings.accessibility = determineSetting(weights["accessibility"]);
    settings.goal = determineSetting(weights["goal"]);
    settings.crystals.tower = determineSetting(weights["tower_open"]);
    settings.crystals.ganon = determineSetting(weights["ganon_open"]);
    settings.mode = determineSetting(weights["world_state"]);
    settings.entrances = determineSetting(weights["entrance_shuffle"]);
    settings.hints = determineSetting(weights["hints"]);
    settings.weapons = determineSetting(weights["weapons"]);
    settings.item.pool = determineSetting(weights["item_pool"]);
    settings.item.functionality = determineSetting(weights["item_functionality"]);
    settings.enemizer.boss_shuffle = determineSetting(weights["boss_shuffle"]);
    settings.enemizer.enemy_shuffle = determineSetting(weights["enemy_shuffle"]);
    settings.enemizer.enemy_damage = determineSetting(weights["enemy_damage"]);
    settings.enemizer.enemy_health = determineSetting(weights["enemy_health"]);

    if (settings.entrances === "crossed") {
        settings.dungeon_items = determineSetting(weights["dungeon_items_entrance"]);
    } else {
        settings.dungeon_items = determineSetting(weights["dungeon_items"]);
    }

    if (settings.enemizer.enemy_shuffle === "shuffled" && settings.mode === "standard") {
        settings.weapons = "assured";
    }

    return settings;
}

function defaultSettings() {
    return {
        "allow_quickswap": true,
        "glitches": "none",
        "item_placement": "advanced",
        "dungeon_items": "standard",
        "accessibility": "items",
        "goal": "ganon",
        "crystals": {
            "ganon": "7",
            "tower": "7"
        },
        "mode": "standard",
        "entrances": "none",
        "hints": "off",
        "weapons": "randomized",
        "item": {
            "pool": "normal",
            "functionality": "normal"
        },
        "tournament": true,
        "spoilers": "mystery",
        "lang":"en",
        "enemizer": {
            "boss_shuffle":"none",
            "enemy_shuffle":"none",
            "enemy_damage":"default",
            "enemy_health":"default"
        }
    }
}

function determineSetting(setting) {
    let keys = Object.keys(setting);
    let weight = randomWeight();
    let current = 0;

    for (let i = 0; i < keys.length; i++) {
        current += setting[keys[i]];
        if (weight < current) {
            return keys[i];
        }
    }

    return keys[keys.length - 1];
}

function randomWeight() {
    return Math.floor(Math.random() * 100);
}