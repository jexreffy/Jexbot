const config = require('../config.json');
const close = require('../commands/close');
const data = require('../data/data.js');
const dick = require('../commands/dick');
const done = require('../commands/done');
const forfeit = require('../commands/forfeit');
const gatekeeper = require('../commands/gatekeeper');
const gtGuess = require('../commands/gtguess');
const hello = require('../commands/hello');
const help = require('../commands/help');
const join = require('../commands/join');
const kick = require('../commands/kick');
const leaderboard = require('../commands/leaderboard');
const leave = require('../commands/leave');
const newRace = require('../commands/new');
const rank = require('../commands/rank');
const ready = require('../commands/ready');
const reset = require('../commands/reset');
const setSeedCode = require('../commands/setSeedCode');
const setSeedLink = require('../commands/setSeedLink');
const spaceballs = require('../commands/spaceballs');
const start = require('../commands/start');
const stats = require('../commands/stats');
const streaming = require('../commands/streaming');
const twitch = require('../commands/twitch');
const unready = require('../commands/unready');

function processDiscordCommand(dClient, tClient, message) {
    const channel = config.channel;

    if (message.channel.name !== channel) return;

    let race = data.getRace();

    if (message.content.match(/^[.!](\bclose\b)/i)) {
        close(race, message, message.channel);
    } else if (message.content.match(/^[.!](\bdick\b)/i)) {
        dick(config, race, message.channel, tClient);
    } else if (message.content.match(/^[.!]((\bdone\b)|(\btime\b))/i)) {
        done(config, race, message.channel, tClient, message.author.username, message);
    } else if (message.content.match(/^[.!](\bforfeit\b)|(\bff\b)/i)) {
        forfeit(config, race, message.channel, tClient, message.author.username, message);
    } else if (message.content.match(/^[.!](\bgatekeeper\b)/i)) {
        gatekeeper(race, message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\bgtguess\b) ([0-9]{1,2})/i)) {
        gtGuess(config, race, message.channel, tClient, null, message.author.username, message.content);
    } else if (message.content.match(/^[.!](\bhello\b)/i)) {
        hello(config, race, tClient, message);
    } else if (message.content.match(/^[.!]((\bjoin\b)|(\benter\b))/i)) {
        join(config, race, message.channel, message.author.username, message);
    } else if (message.content.match(/^[.!](\bkick\b)([ ]{0,1})([a-zA-Z0-9%]{0,20})/i)) {
        kick(config, race, message.channel, tClient, message);
    } else if (message.content.match(/^[.!](\bleaderboard\b) ([ a-zA-Z0-9%]{3,20})/i)) {
        leaderboard(message.channel, message);
    } else if (message.content.match(/^[.!]((\bleave\b)|(\bunjoin\b))/i)) {
        leave(config, race, message.channel, message.author.username, message);
    } else if (message.content.match(/^[.!](\bnew\b)/i)) {
        newRace(config, race, message.channel, message);
    } else if (message.content.match(/^[.!](\brank\b) ([ a-zA-Z0-9%]{3,20})/i)) {
        rank(message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\bready\b)/i)) {
        ready(config, race, message.channel, tClient, message.author.username);
    } else if (message.content.match(/^[.!](\breset\b)/i)) {
        reset(race, message.channel, message);
    } else if (message.content.match(/^[.!](\bsetseedcode\b) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100})/i)) {
        setSeedCode(config, race, message.channel, message.author.username, message);
    }else if (message.content.match(/^[.!](\bsetseedlink\b) (https:\/\/[a-zA-Z0-9_%\/?,.]{4,70})/i)) {
        setSeedLink(config, race, message.channel, message.author.username, message);
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
    } else if (message.content.match(/^[.!](\bunready\b)/i)) {
        unready(race, message.channel, message.author.username, message);
    }

    data.setRace(race);

    if (message && !message.author.bot) {
        message.delete().then().catch(console.error);
    }
}

function processTwitchCommand(dClient, tClient, tChannel, tags, message, self) {
    if (self) return;

    let race = data.getRace();

    let dChannel = dClient.channels.cache.find(channel => channel.name === config.channel);

    if (message.match(/^[!](\bdick\b)/i)) {
        dick(config, race, dChannel, tClient);
    } else if (message.match(/^[.!](\bgtguess\b) ([0-9]{1,2})/i)) {
        gtGuess(config, race, dChannel, tClient, tChannel, tags.username, message);
    } else if (message.match(/^[!](\bhelp\b)/i)) {
        help(config, tClient, tChannel);
    } else if (message.match(/^[!](\bspaceballs\b)/i)) {
        spaceballs(config, race, dChannel, tClient);
    }

    data.setRace(race);
}

module.exports = (...args) => {
    if (args.length === 3) {
        processDiscordCommand(args[0], args[1], args[2]);
    } else if (args.length === 6) {
        processTwitchCommand(args[0], args[1], args[2], args[3], args[4], args[5]);
    }
};