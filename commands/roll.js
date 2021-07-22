'use strict'
const JexCommand = require('../commands/command');

module.exports = class CommandRoll extends JexCommand {
    constructor(app) {
        super(app);
    }

    get commandName() {
        return 'roll';
    }

    get isRaceCommand() {
        return true;
    }

    isCommandValid(context) {
        return context.origination === this._app.DISCORD;
    }

    executeCommand(context) {
        let categories = this._app.db.getCategories();
        let categoryName = this._app.config['defaultCategory'];
        let username = context.username;

        let helpMatch = context.message.match(/^[.!](\broll help\b) ([a-zA-Z0-9%]{4,20})/i);

        if (helpMatch && helpMatch.length > 2) {
            CommandRoll.#helpCategory(this._app, context, categories, helpMatch[2]);
            return;
        }

        helpMatch = context.message.match(/^[.!](\broll help\b)/i);

        if (helpMatch && helpMatch.length > 0) {
            CommandRoll.#helpGeneral(this._app, context, categories);
            return;
        }

        /*if (message.attachments && message.attachments.size > 0) {
            let attachment = message.attachments.first();
            axios.get(attachment.url).then(result => {
                if (race) {
                    dChannel.send(`**I could tell you the nonsense that ${username} has in this Plando, but where's the fun in that...**`).then().catch(console.error);
                }

                rollSeed(config, race, dChannel, PLANDO_URL, plandoSettings(result), username);
            }).catch(console.error);
        } else*/ if (context.activeRace && context.activeRace.relay) {
            let match = message.content.match(/^[.!](\broll\b) ([a-zA-Z0-9<>:]{4,20})/i);

            if (match && match.length > 2) {
                if (match[2] === "sotweasy" || match[2] === "sotwmedium" || match[2] === "sotwhard") {
                    categoryName = match[2];
                    let seed = this._app.db.getSotwSeed(message.guild.id, categoryName);
                    context.activeRace.legs.push(seed);
                    this._app.db.setRaceData(context.guildId, context.activeRace);
                    this._app.routines['updateRaceMessage'](this._app, context);
                } else {
                    for (let i = 0; i < categories.length; i++) {
                        if (match[2] === categories[i]) {
                            categoryName = categories[i];
                            break;
                        }
                    }

                    let settings = this._app.routines['categorySettings'](this._app, categoryName);
                    this.#rollSeed(this._app, context, settings);
                }
            }
        } else if (!context.activeRace.finished) {
            this._app.sendToDiscordRaceChannel(context.guildId, `**${username} has sealed their fate. I'd pray to RN Jesus while the seed is rolling if I were you...**`).then().catch(console.error);
            categoryName = context.activeRace.categoryToRoll;

            let settings = this._app.routines['categorySettings'](this._app, categoryName);
            this.#rollSeed(this._app, context, settings);
        } else {
            let match = context.message.match(/^[.!](\broll\b) ([a-zA-Z0-9<>:]{4,20})/i);

            if (match && match.length > 2) {
                for (let i = 0; i < categories.length; i++) {
                    if (match[2] === categories[i]) {
                        categoryName = categories[i];
                        break;
                    }
                }
            }

            let settings = this._app.routines['categorySettings'](this._app, categoryName);

            this._app.sendToDiscordRaceChannel(context.guildId, `**Generating ${settings.title} seed...**`).then().catch(console.error);

            this.#rollSeed(this._app, context, settings);
        }
    }

    #rollSeed(app, context, category) {
        app.axios.post(category.url, category.settings).then(result => {
            let seed = this._app.routines['processSeed'](app.config['codeStartAt'], app.config['guilds'][context.guildId]['codeMap'], category.name, category.title, result);

            if (!context.activeRace.finished) {
                if (context.activeRace.relay) {
                    context.activeRace.legs.push(seed);
                } else {
                    context.activeRace.seedRoller = context.username;
                    context.activeRace.seedLink = seed.link;
                    context.activeRace.seedCode = seed.code;
                }

                this._app.db.setRaceData(context.guildId, context.activeRace);
                this._app.routines['updateRaceMessage'](this._app, context);
            }

            this._app.sendToDiscordRaceChannel(context.guildId, `${seed.link} ${seed.code}`).then().catch(console.error);
        }).catch(console.error);
    }

    static #helpCategory(app, context, categories, helpMatch) {
        let categoryName = app.config['defaultCategory'];
        for (let i = 0; i < categories.length; i++) {
            if (helpMatch[2] === categories[i]) {
                categoryName = categories[i];
                break;
            }
        }

        let category = app.db.getCategory(categoryName);

        let message = `**Category ${categoryName} - ${category.name}**\n\n\`\`\`${category.description}`;

        if (!(category.mystery || category.random)) {
            message += `\nSettings: {${JSON.stringify(category.settings)}}`;
        }

        message += `\`\`\``;

        app.sendToDiscordRaceChannel(context.guildId, message).then().catch(console.error);
    }

    static #helpGeneral(app, context, categories) {
        let message = `**.roll {category}**\nCategories:\n`;

        for (let i = 0; i < categories.length; i++) {
            message += `\n\`${categories[i]}\` - ${app.db.getCategory(categories[i]).name}`;
        }

        app.sendToDiscordRaceChannel(context.guildId, message).then().catch(console.error);
    }
}

