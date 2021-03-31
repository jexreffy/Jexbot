const getCustomizerSettings = require('../common/getCustomizerSettings');

module.exports = (plando) => {
    let settings = getCustomizerSettings();

    settings.glitches = plando["randomizer.glitches_required"];
    settings.item_placement = plando["randomizer.item_placement"];
    settings.dungeon_items = plando["randomizer.dungeon_items"];
    settings.accessibility = plando["randomizer.accessibility"];
    settings.goal = plando["randomizer.goal"];
    settings.crystals.ganon = plando["randomizer.ganon_open"];
    settings.crystals.tower = plando["randomizer.tower_open"];
    settings.mode = plando["randomizer.world_state"];
    settings.hints = plando["randomizer.hints"];
    settings.weapons = plando["randomizer.weapons"];
    settings.item.pool = plando["randomizer.item_pool"];
    settings.item.functionality = plando["randomizer.item_functionality"];
    settings.enemizer.boss_shuffle = plando["randomizer.boss_shuffle"];
    settings.enemizer.enemy_shuffle = plando["randomizer.enemy_shuffle"];
    settings.enemizer.enemy_damage = plando["randomizer.enemy_damage"];
    settings.enemizer.enemy_health = plando["randomizer.enemy_health"];

    settings.name = plando["vt.custom.name"];
    settings.notes = plando["vt.custom.notes"];
    settings.l = plando["vt.custom.locations"];
    settings.drops = plando["vt.custom.prizepacks"];

    settings.custom.item.count = plando["vt.custom.items"];
    settings.custom.drop.count = plando["vt.custom.drops"];

    settings.eq = [];

    let keys = Object.keys(plando["vt.custom.equipment"]);

    for (let i = 0; i < keys.length; i++) {
        if (typeof plando["vt.custom.equipment"][keys[i]] === "boolean" && plando["vt.custom.equipment"][keys[i]]) {
            settings.eq.push(keys[i]);
        } else if (typeof plando["vt.custom.equipment"][keys[i]] === "number" && plando["vt.custom.equipment"][keys[i]] > 0) {
            for (let j = 0; j < plando["vt.custom.equipment"][keys[i]]; j++) {
                settings.eq.push(keys[i]);
            }
        }
    }

    keys = Object.keys(plando["vt.custom.settings"]);

    for (let i = 0; i < keys.length; i++) {
        settings[keys[i]] = plando["vt.custom.settings"][keys[i]];
    }

    keys = Object.keys(plando["vt.custom.glitches"]);

    for (let i = 0; i < keys.length; i++) {
        settings[keys[i]] = plando["vt.custom.glitches"][keys[i]];
    }

    return settings;
}