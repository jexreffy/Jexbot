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
        let result = "";

        if (context.origination !== this._app.DISCORD) {
            result = "Discord must be origination of command";
        }

        return result;
    }

    executeCommand(context) {
        let helpMatch = context.message.match(/^[.!](\broll help\b) ((alttpr)|(ff4fe)) ([a-zA-Z0-9%]{2,20})/i);

        if (helpMatch && helpMatch.length > 5) {
            CommandRoll.#helpCategory(this._app, context, helpMatch[2], helpMatch[5]);
            return;
        }

        helpMatch = context.message.match(/^[.!](\broll help\b)/i);

        if (helpMatch && helpMatch.length > 0) {
            CommandRoll.#helpGeneral(this._app, context);
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
            let game = 'alttpr';
            let category = '';
            let match = context.message.match(/^[.!](\broll\b) ((alttpr)|(ff4fe)) ([a-zA-Z0-9<>:]{2,20})/i);

            if (match && match.length() > 5) {
                game = match[2];
                category = match[5];
            } else {
                match = context.message.match(/^[.!](\broll\b) ([a-zA-Z0-9<>:]{2,20})/i);
                if (match && match.length > 2) {
                    game = 'alttpr';
                    category = match[2];
                }
            }

            if (match && match.length > 2) {
                if (category === 'sotweasy' || category === 'sotwmedium' || category === 'sotwhard' || category === 'sotwtourney') {
                    let seed = this._app.db.getSotwSeed(message.guild.id, game, category);
                    context.activeRace.legs.push(seed);
                    this._app.db.setRaceData(context.guildId, context.activeRace);
                    this._app.routines['updateRaceMessage'](this._app, context);
                } else if (game === 'ff4fe') {
                    let categories = this._app.db.getCategories('ff4fe');
                    let categoryName = this._app.config['defaultCategory'];

                    for (let i = 0; i < categories.length; i++) {
                        if (category === categories[i]) {
                            categoryName = categories[i];
                            break;
                        }
                    }

                    let settings = this._app.routines['categorySettings'](this._app, game, categoryName);

                    let seed = {
                        category: settings.name,
                        name: settings.title,
                        link: null,
                        code: null
                    }

                    context.activeRace.legs.push(seed);
                    this._app.db.setRaceData(context.guildId, context.activeRace);
                    this._app.routines['updateRaceMessage'](this._app, context);
                } else {
                    let categories = this._app.db.getCategories(game);
                    let categoryName = this._app.config['defaultCategory'];

                    for (let i = 0; i < categories.length; i++) {
                        if (category === categories[i]) {
                            categoryName = categories[i];
                            break;
                        }
                    }

                    let settings = this._app.routines['categorySettings'](this._app, game, categoryName);
                    this.#rollSeed(this._app, context, settings);
                }
            }
        } else if (!context.activeRace.finished) {
            this._app.sendToDiscordRaceChannel(context.guildId, `**${context.displayName} has sealed their fate. I'd pray to RN Jesus while the seed is rolling if I were you...**`).then().catch(console.error);
            let game = context.activeRace.game;
            let category = context.activeRace.categoryToRoll;

            if (game === 'ff4fe') {
                this._app.sendToDiscordRaceChannel(context.guildId, `**Jexbot cannot currently roll FF4FE seeds.**`).then().catch(console.error);
                return;
            }

            let settings = this._app.routines['categorySettings'](this._app, game, category);
            this.#rollSeed(this._app, context, settings);
        } else {
            let game = 'alttpr';
            let category = '';
            let categoryName = this._app.config['defaultCategory'];
            let match = context.message.match(/^[.!](\broll\b) ((alttpr)|(ff4fe)) ([a-zA-Z0-9<>:]{2,20})/i);

            if (match && match.length > 5) {
                game = match[2];
                category = match[5];
            } else {
                match = context.message.match(/^[.!](\broll\b) ([a-zA-Z0-9<>:]{2,20})/i);
                if (match && match.length > 2) {
                    game = 'alttpr';
                    category = match[2];
                }
            }

            if (game === 'ff4fe') {
                this._app.sendToDiscordRaceChannel(context.guildId, `**Jexbot cannot currently roll FF4FE seeds.**`).then().catch(console.error);
                return;
            }

            let categories = this._app.db.getCategories(game);

            if (match && match.length > 2) {
                for (let i = 0; i < categories.length; i++) {
                    if (category === categories[i]) {
                        categoryName = categories[i];
                        break;
                    }
                }
            }

            let settings = this._app.routines['categorySettings'](this._app, game, categoryName);

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
                    context.activeRace.seedRoller = context.displayName;
                    context.activeRace.seedLink = seed.link;
                    context.activeRace.seedCode = seed.code;
                }

                this._app.db.setRaceData(context.guildId, context.activeRace);
                this._app.routines['updateRaceMessage'](this._app, context);
            }

            this._app.sendToDiscordRaceChannel(context.guildId, `${seed.link} ${seed.code}`).then().catch(console.error);
        }).catch(console.error);
    }

    static #helpCategory(app, context, helpGame, helpCategory) {
        let categories = app.db.getCategories(helpGame);
        let categoryName = app.config['defaultCategory'];
        for (let i = 0; i < categories.length; i++) {
            if (helpCategory === categories[i]) {
                categoryName = categories[i];
                break;
            }
        }

        let category = app.db.getCategory(helpGame, categoryName);

        let message = `**Category ${helpGame} ${categoryName} - ${category.name}**\n\n\`\`\`${category.description}`;

        if (!(category.mystery || category.random)) {
            message += `\nSettings: {${JSON.stringify(category.settings)}}`;
        }

        message += `\`\`\``;

        app.sendToDiscordRaceChannel(context.guildId, message).then().catch(console.error);
    }

    static #helpGeneral(app, context) {
        let message = `**.roll {game} {category}**\nALTTPR Categories (alttpr):\n`;

        let categories = app.db.getCategories('alttpr');

        for (let i = 0; i < categories.length; i++) {
            message += `\n\`${categories[i]}\` - ${app.db.getCategory('alttpr', categories[i]).name}`;

            if (message.length > 1900) {
                app.sendToDiscordRaceChannel(context.guildId, message).then().catch(console.error);
                message = "";
            }
        }

        app.sendToDiscordRaceChannel(context.guildId, message).then().catch(console.error);

        message = `FF4FE Categories (ff4fe) (NOTE: Cannot currently be rolled with Jexbot):\n`;

        categories = app.db.getCategories('ff4fe');

        for (let i = 0; i < categories.length; i++) {
            message += `\n\`${categories[i]}\` - ${app.db.getCategory('ff4fe', categories[i]).name}`;

            if (message.length > 1900) {
                app.sendToDiscordRaceChannel(context.guildId, message).then().catch(console.error);
                message = "";
            }
        }

        app.sendToDiscordRaceChannel(context.guildId, message).then().catch(console.error);
    }
}

