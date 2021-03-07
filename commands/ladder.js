const data = require('../data/data.js');

module.exports = (config, race, dChannel, message) => {
    if (race.finished && config.botOwnerName === message.author.username && config.botOwnerGuild === message.guild.id) {
        let match = message.content.match(/^[.!](\bladder\b) ([a-zA-Z0-9<>:]{4,20})/i);

        let category = config.defaultCategory;

        if (match.length > 2) {
            let categories = Object.keys(config.categories);

            for (let i = 0; i < categories.length; i++) {
                if (match[2] === categories[i]) {
                    category = categories[i];
                    break;
                }
            }
        }

        race.ladder = true;
        race.started = true;
        race.finished = false;
        race.startedAt = Date.now();
        race.initiatedAt = race.startedAt;
        race.escapeItem = null;
        race.lastHello = null;
        race.pingIndex = -1;
        race.countdownIndex = -1;
        race.remainingPlayers = 0
        race.players = [];
        race.lastCallback = null;
        race.blueballs = -1;
        race.guessGameStarted = false;
        race.guesses = [];
        race.gtRunner = null;
        race.gtbk = -1;
        race.gtbkWinner = null;
        race.spoilersAllowed = false;
        race.gtbkGuess = -1;
        race.gatekeeper = null;
        race.category = category;
        race.messageId = null;
        race.seedCode = null;
        race.seedLink = null;
        race.seedRoller = null;
        race.mutlistream = '';
        race.status = '';
        race.lastDickTime = null;
        race.dickCount = 0;

        for (let i = 0; i < 22; i++) {
            race.guesses.push(null);
        }

        const guildId = dChannel.guild.id;
        data.setActiveRace(guildId);
    }
};