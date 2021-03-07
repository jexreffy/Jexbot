const config = require('../config.json');
const data = require('../data/data.js');
const blueballs = require('../commands/blueballs');
const callback = require('../commands/callback');
const close = require('../commands/close');
const dick = require('../commands/dick');
const done = require('../commands/done');
const escape = require('../commands/escape');
const forfeit = require('../commands/forfeit');
const gatekeeper = require('../commands/gatekeeper');
const gtbk = require('../commands/gtbk');
const gtEnter = require('../commands/gtEnter');
const gtGuess = require('../commands/gtguess');
const help = require('../commands/help');
const join = require('../commands/join');
const kick = require('../commands/kick');
const ladder = require('../commands/ladder');
const leaderboard = require('../commands/leaderboard');
const leave = require('../commands/leave');
const mode = require('../commands/mode');
const newRace = require('../commands/new');
const rank = require('../commands/rank');
const ready = require('../commands/ready');
const reset = require('../commands/reset')
const roll = require('../commands/roll');
const spaceballs = require('../commands/spaceballs');
const start = require('../commands/start');
const stats = require('../commands/stats');
const streaming = require('../commands/streaming');
const twitch = require('../commands/twitch');
const twitchBot = require('../commands/twitchbot');
const unready = require('../commands/unready');

function processDiscordCommand(dClient, tClient, message) {
    if (message.author.bot) return;

    const guildId = message.guild.id;

    const channel = config.guilds[guildId].channel;

    if (message.channel.name !== channel) return;

    const activeRace = data.getActiveRace();

    if (!activeRace) {
        let race = data.getRaceData(guildId);

        processDiscordInactiveCommands(dClient, tClient, config, race, message);

        data.setRaceData(guildId, race);
    } else if (guildId === activeRace) {
        let race = data.getRaceData(guildId);

        if (race.ladder) {
            processDiscordLadderCommands(dClient, tClient, config, race, message);
        } else if (race.started) {
            processDiscordRaceActiveCommands(dClient, tClient, config, race, message);
        } else {
            processDiscordRaceLobbyCommands(dClient, tClient, config, race, message);
        }

        data.setRaceData(guildId, race);
    } else {
        message.channel.send("**There is a race currently being run on another server.**");
    }

    if (message) {
        message.delete().then().catch(console.error);
    }
}

function processDiscordInactiveCommands(dClient, tClient, config, race, message) {
    if (message.content.match(/^[.!](\bladder\b) ([a-zA-Z0-9%]{4,20})/i)) {
        ladder(config, race, message.channel, message);
    } else if (message.content.match(/^[.!](\bleaderboard\b) ([ a-zA-Z0-9%]{3,20})/i)) {
        leaderboard(message.channel, message);
    } else if (message.content.match(/^[.!](\bnew\b)/i)) {
        newRace(config, race, message.channel, message);
    } else if (message.content.match(/^[.!](\brank\b) ([ a-zA-Z0-9%]{3,20})/i)) {
        rank(message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\bspaceballs\b)/i)) {
        spaceballs(config, race, message.channel, tClient);
    } else if (message.content.match(/^[.!](\bstats\b)([ ]{0,1})([a-zA-Z 0-9%]{0,30})/i)) {
        stats(race, message.channel, message);
    }
}

function processDiscordLadderCommands(dClient, tClient, config, race, message) {
    if (message.content.match(/^[.!](\bclose\b)/i)) {
        close(race, message, message.channel);
    }
}

function processDiscordRaceActiveCommands(dClient, tClient, config, race, message) {
    if (message.content.match(/^[.!](\bblueballs\b) ([0-9]{1,2})/i)) {
        blueballs(race, message.content);
    } else if (message.content.match(/^[.!](\bclose\b)/i)) {
        close(race, message, message.channel);
    } else if (message.content.match(/^[.!](\bdick\b)/i)) {
        dick(config, race, message.channel, tClient);
    } else if (message.content.match(/^[.!](\bdone\b)/i)) {
        done(config, race, message.channel, tClient, message.author.username, message);
    } else if (message.content.match(/^[.!](\bescape\b) ([a-zA-Z0-9<>:]{4,100})/i)) {
        escape(config, race, message.channel, message);
    } else if (message.content.match(/^[.!](\bforfeit\b)|(\bff\b)/i)) {
        forfeit(config, race, message.channel, tClient, message.author.username, message);
    } else if (message.content.match(/^[.!](\bgtguess\b) ([0-9]{1,2})/i)) {
        gtGuess(config, race, message.channel, tClient, null, message.author.username, message.content);
    } else if (message.content.match(/^[.!](\bkick\b)([ ]{0,1})([a-zA-Z0-9%]{0,20})/i)) {
        kick(config, race, message.channel, tClient, message);
    } else if (message.content.match(/^[.!](\bspaceballs\b)/i)) {
        spaceballs(config, race, message.channel, tClient);
    }
}

function processDiscordRaceLobbyCommands(dClient, tClient, config, race, message) {
    if (message.content.match(/^[.!](\bclose\b)/i)) {
        close(race, message, message.channel);
    } else if (message.content.match(/^[.!](\bgatekeeper\b)/i)) {
        gatekeeper(race, message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\bjoin\b)/i)) {
        join(config, race, message.channel, message.author.username, message);
    } else if (message.content.match(/^[.!](\bkick\b)([ ]{0,1})([a-zA-Z0-9%]{0,20})/i)) {
        kick(config, race, message.channel, tClient, message);
    } else if (message.content.match(/^[.!](\bleaderboard\b) ([ a-zA-Z0-9%]{3,20})/i)) {
        leaderboard(message.channel, message);
    } else if (message.content.match(/^[.!](\bleave\b)/i)) {
        leave(config, race, message.channel, message.author.username, message);
    } else if (message.content.match(/^[.!](\brank\b) ([ a-zA-Z0-9%]{3,20})/i)) {
        rank(message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\bready\b)/i)) {
        ready(config, race, message.channel, message.author.username);
    } else if (message.content.match(/^[.!](\breset\b)/i)) {
        reset(race, message.channel, message);
    } else if (message.content.match(/^[.!](\broll\b)/i)) {
        roll(config, race, message.channel, message.author.username);
    } else if (message.content.match(/^[.!](\bspaceballs\b)/i)) {
        spaceballs(config, race, message.channel, tClient);
    } else if (message.content.match(/^[.!](\bstart\b)/i)) {
        start(config, race, message.channel, tClient, message, message.author.username);
    } else if (message.content.match(/^[.!](\bstats\b)([ ]{0,1})([a-zA-Z 0-9%]{0,30})/i)) {
        stats(race, message.channel, message);
    } else if (message.content.match(/^[.!](\bstreaming\b) ((\bon\b)|(\boff\b))/i)) {
        streaming(race, message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\btwitch\b) ([a-zA-Z0-9_]{4,20})/i)) {
        twitch(race, message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\btwitchbot\b) ((\bon\b)|(\boff\b))/i)) {
        twitchBot(race, message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\bunready\b)/i)) {
        unready(race, message.channel, message.author.username, message);
    }
}

function processTwitchCommand(dClient, tClient, tChannel, tags, message, self) {
    if (self) return;

    const guildId = data.getActiveRace();
    let race = data.getRaceData(guildId);

    let dChannel = dClient.channels.cache.find(channel => channel.name === config.guilds[guildId].channel);

    if (race.ladder) {
        processTwitchLadderCommands(dChannel, tClient, tChannel, config, race, tags, message, self);
    } else {
        processTwitchRaceActiveCommands(dChannel, tClient, tChannel, config, race, tags, message, self);
    }

    data.setRaceData(guildId, race);
}

function processTwitchLadderCommands(dChannel, tClient, tChannel, config, race, tags, message, self) {
    if (message.match(/^[.!](\bblueballs\b) ([0-9]{1,2})/i)) {
        blueballs(race, tClient, tChannel, message);
    } else if (message.match(/^[.!](\bgtbk\b) ([0-9]{1,2})/i)) {
        gtbk(config, race, tClient, tChannel, message);
    } else if (message.match(/^[.!](\bgtenter\b)/i)) {
        gtEnter(config, race, tClient, tChannel);
    } else if (message.match(/^[.!](\bgtguess\b) ([0-9]{1,2})/i)) {
        gtGuess(config, race, dChannel, tClient, tChannel, tags.username, message);
    } else if (message.match(/^[!](\bhelp\b)/i)) {
        help(config, tClient, tChannel);
    } else if (message.match(/^[!](\bmode\b)/i)) {
        mode(config, tClient, tChannel);
    } else if (message.match(/^[!](\bspaceballs\b)/i)) {
        spaceballs(config, race, dChannel, tClient);
    }
}

function processTwitchRaceActiveCommands(dChannel, tClient, tChannel, config, race, tags, message, self) {
    if (message.match(/^[.!](\bblueballs\b) ([0-9]{1,2})/i)) {
        blueballs(race, tClient, tChannel, message);
    } else if (message.match(/^[!](\bcallback\b)/i)) {
        callback(config, race, dChannel, tClient, tChannel);
    } else if (message.match(/^[!](\bdick\b)/i)) {
        dick(config, race, dChannel, tClient);
    } else if (message.match(/^[.!](\bgtbk\b) ([0-9]{1,2})/i)) {
        gtbk(config, race, tClient, tChannel, message);
    } else if (message.match(/^[.!](\bgtenter\b)/i)) {
        gtEnter(config, race, tClient, tChannel);
    } else if (message.match(/^[.!](\bgtguess\b) ([0-9]{1,2})/i)) {
        gtGuess(config, race, dChannel, tClient, tChannel, tags.username, message);
    } else if (message.match(/^[!](\bhelp\b)/i)) {
        help(config, tClient, tChannel);
    } else if (message.match(/^[!](\bmode\b)/i)) {
        mode(config, tClient, tChannel);
    } else if (message.match(/^[!](\bspaceballs\b)/i)) {
        spaceballs(config, race, dChannel, tClient);
    }
}

module.exports = (...args) => {
    if (args.length === 3) {
        processDiscordCommand(args[0], args[1], args[2]);
    } else if (args.length === 6) {
        processTwitchCommand(args[0], args[1], args[2], args[3], args[4], args[5]);
    }
};