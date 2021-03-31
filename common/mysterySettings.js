const getCustomizerSettings = require('../common/getCustomizerSettings');

module.exports = (weights) => {
    let settings = getCustomizerSettings();

    settings.spoilers = "mystery";
    settings.glitches = determineSetting(weights["glitches_required"]);
    settings.item_placement = determineSetting(weights["item_placement"]);
    settings.accessibility = determineSetting(weights["accessibility"]);
    settings.goal = determineSetting(weights["goal"]);
    settings.crystals.tower = determineSetting(weights["tower_open"]);
    settings.crystals.ganon = determineSetting(weights["ganon_open"]);
    settings.mode = determineSetting(weights["mode"]);
    settings.hints = determineSetting(weights["hints"]);
    settings.weapons = determineSetting(weights["weapons"]);
    settings.item.pool = determineSetting(weights["item_pool"]);
    settings.item.functionality = determineSetting(weights["item_functionality"]);
    settings.enemizer.boss_shuffle = determineSetting(weights["boss_shuffle"]);
    settings.enemizer.enemy_shuffle = determineSetting(weights["enemy_shuffle"]);
    settings.enemizer.enemy_damage = determineSetting(weights["enemy_damage"]);
    settings.enemizer.enemy_health = determineSetting(weights["enemy_health"]);

    if (settings.goal === "triforce-hunt") {
        settings.custom["item.Goal.Required"] = "20";
        settings.custom.item.count.TriforcePiece = 30;
    }

    let startBoots = determineSetting(weights["starting_boots"]) === "true";
    let startFlute = determineSetting(weights["starting_boots"]) === "true";

    if (startBoots || startFlute) {
        settings.entrances = "none";

        if (startFlute) {
            settings.eq.splice(0, 0, settings.mode === "standard" ? 'OcarinaInactive' : 'OcarinaActive');
            settings.custom.item.count.OcarinaInactive = 0;
        }

        if (startBoots) {
            settings.eq.splice(0, 0, 'PegasusBoots');
            settings.custom.item.count.PegasusBoots = 0;
        }
    } else {
        settings.entrances = determineSetting(weights["entrance_shuffle"]);
    }

    if (settings.entrances === "crossed") {
        settings.dungeon_items = determineSetting(weights["dungeon_items"]);
    } else {
        settings.dungeon_items = "standard";
        settings.custom["region.wildBigKeys"] = determineSetting(weights["wild_big_keys"]) === "true";
        settings.custom["region.wildCompasses"] = determineSetting(weights["wild_compasses"]) === "true";
        settings.custom["region.wildKeys"] = determineSetting(weights["wild_keys"]) === "true";
        settings.custom["region.wildMaps"] = determineSetting(weights["wild_maps"]) === "true";

        if (settings.custom["region.wildBigKeys"] || settings.custom["region.wildKeys"]) {
            settings.custom["rom.freeItemMenu"] = true;
            settings.custom["rom.freeItemText"] = true;
        }

        if (settings.custom["region.wildMaps"]) {
            settings.custom["rom.freeItemMenu"] = true;
            settings.custom["rom.freeItemText"] = true;
            settings.custom["rom.mapOnPickup"] = true;
        }

        if (settings.custom["region.wildCompasses"]) {
            settings.custom["rom.freeItemMenu"] = true;
            settings.custom["rom.freeItemText"] = true;
            settings.custom["rom.dungeonCount"] = "pickup";
        }
    }

    if (settings.enemizer.enemy_shuffle === "shuffled" && settings.mode === "standard") {
        settings.weapons = "assured";
    }

    return settings;
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