const axios = require('axios');
const categorySettings = require('../common/categorySettings');
const plandoSettings = require('../common/plandoSettings');
const processSeed = require('../common/processSeed');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, message) => {
    if (race && race.seedLink) return;

    let categories = db.getCategories();
    let categoryName = config.defaultCategory;
    let username = message.author.username;

    let helpMatch = message.content.match(/^[.!](\broll help\b) ([a-zA-Z0-9%]{4,20})/i);

    if (helpMatch && helpMatch.length > 2) {
        helpCategory(config, db, dChannel, categories, helpMatch[2]);
        return;
    }

    helpMatch = message.content.match(/^[.!](\broll help\b)/i);

    if (helpMatch && helpMatch.length > 0) {
        helpGeneral(config, db, dChannel, categories);
        return;
    }

    if (message.attachments && message.attachments.size > 0) {
        /*let attachment = message.attachments.first();
        axios.get(attachment.url).then(result => {
            if (race) {
                dChannel.send(`**I could tell you the nonsense that ${username} has in this Plando, but where's the fun in that...**`).then().catch(console.error);
            }

            rollSeed(config, race, dChannel, PLANDO_URL, plandoSettings(result), username);
        }).catch(console.error);*/
    } else if (race && race.relay) {
        let match = message.content.match(/^[.!](\broll\b) ([a-zA-Z0-9<>:]{4,20})/i);

        if (match && match.length > 2) {
            if (match[2] === "sotweasy" || match[2] === "sotwmedium" || match[2] === "sotwhard") {
                categoryName = match[2];
                let seed = db.getSotwSeed(message.guild.id, categoryName);
                race.legs.push(seed);

                updateRaceMessage(db, race, dChannel);
            } else {
                for (let i = 0; i < categories.length; i++) {
                    if (match[2] === categories[i]) {
                        categoryName = categories[i];
                        break;
                    }
                }

                rollSeed(config, db, race, dChannel, username, categorySettings(config, db, categoryName));
            }
        }
    } else if (race) {
        dChannel.send(`**${username} has sealed their fate. I'd pray to RN Jesus while the seed is rolling if I were you...**`).then().catch(console.error);
        categoryName = race.categoryToRoll;

        rollSeed(config, db, race, dChannel, username, categorySettings(config, db, categoryName));
    } else {
        let match = message.content.match(/^[.!](\broll\b) ([a-zA-Z0-9<>:]{4,20})/i);

        if (match && match.length > 2) {
            for (let i = 0; i < categories.length; i++) {
                if (match[2] === categories[i]) {
                    categoryName = categories[i];
                    break;
                }
            }
        }

        let settings = categorySettings(config, db, categoryName);

        dChannel.send(`**Generating ${settings.title} seed...**`).then().catch(console.error);

        rollSeed(config, db, race, dChannel, username, settings);
    }
}

function helpCategory(config, db, dChannel, categories, helpMatch) {
    let categoryName = config.defaultCategory;
    for (let i = 0; i < categories.length; i++) {
        if (helpMatch[2] === categories[i]) {
            categoryName = categories[i];
            break;
        }
    }

    let category = db.getCategory(categoryName);

    let message = `**Category ${categoryName} - ${category.name}**\n\n\`\`\`${category.description}`;

    if (!(category.mystery || category.random)) {
        message += `\nSettings: {${JSON.stringify(category.settings)}}`;
    }

    message += `\`\`\``;

    dChannel.send(message).then().catch(console.error);
}

function helpGeneral(config, db, dChannel, categories) {
    let message = `**.roll {category}**\nCategories:\n`;

    for (let i = 0; i < categories.length; i++) {
        message += `\n\`${categories[i]}\` - ${db.getCategory(categories[i]).name}`;
    }

    dChannel.send(message).then().catch(console.error);
}

function rollSeed(config, db, race, dChannel, username, category) {
    axios.post(category.url, category.settings).then(result => {
        let guildId = dChannel.guild.id;
        let seed = processSeed(config, guildId, category.name, category.title, result);

        if (race) {
            if (race.relay) {
                race.legs.push(seed);
            } else {
                race.seedRoller = username;
                race.seedLink = seed.link;
                race.seedCode = seed.code;
            }

            updateRaceMessage(db, race, dChannel);
            db.setRaceData(dChannel.guild.id, race);
        }

        dChannel.send(`${seed.link} ${seed.code}`).then().catch(console.error);
    }).catch(console.error);
}