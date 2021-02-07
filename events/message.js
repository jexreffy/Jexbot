const config = require('../config.json');
const close = require('../commands/close');
const dick = require('../commands/dick');
const done = require('../commands/done');
const forfeit = require('../commands/forfeit');
const join = require('../commands/join');
const kick = require('../commands/kick');
const leaderboard = require('../commands/leaderboard');
const leave = require('../commands/leave');
const newrace = require('../commands/new');
const rank = require('../commands/rank');
const ready = require('../commands/ready');
const reset = require('../commands/reset');
const setSeedCode = require('../commands/setSeedCode');
const setSeedLink = require('../commands/setSeedLink');
const spaceballs = require('../commands/spaceballs');
const stats = require('../commands/stats');
const streaming = require('../commands/streaming');
const submit = require('../commands/submit');
const twitch = require('../commands/twitch');
const unready = require('../commands/unready');

module.exports = (client, race, message) => {
    const channel = config.channel;

    if (message.channel.name === channel && message.content.match(/^[.!](\bclose\b)/i)) {
        close(race, message, message.channel);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\bdick\b)/i)) {
        dick(race, message.channel);
    } else if (message.channel.name === channel && message.content.match(/^[.!]((\bdone\b)|(\btime\b))/i)) {
        done(race, message.channel, message.author.username, message);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\bforfeit\b)|(\bff\b)/i)) {
        forfeit(race, message.channel, message.author.username, message);
    } else if (message.channel.name === channel && message.content.match(/^[.!]((\bjoin\b)|(\benter\b))/i)) {
        join(race, message.channel, message.author.username, message);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\bkick\b)([ ]{0,1})([a-zA-Z0-9%]{0,20})/i)) {
        kick(race, message.channel, message);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\bleaderboard\b) ([ a-zA-Z0-9%]{3,20})/i)) {
        leaderboard(message.channel, message);
    } else if (message.channel.name === channel && message.content.match(/^[.!]((\bleave\b)|(\bunjoin\b))/i)) {
        leave(race, message.channel, message.author.username, message);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\bnew\b)/i)) {
        newrace(race, message.channel, message);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\brank\b) ([ a-zA-Z0-9%]{3,20})/i)) {
        rank(message.channel, message, message.author.username);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\bready\b)/i)) {
        ready(race, message.channel, message.author.username, message);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\breset\b)/i)) {
        reset(race, message.channel, message);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\bsetseedcode\b) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100}) ([a-zA-Z0-9<>:]{4,100})/i)) {
        setSeedCode(race, message.channel, message.author.username, message);
    }else if (message.channel.name === channel && message.content.match(/^[.!](\bsetseedlink\b) (https:\/\/[a-zA-Z0-9_%\/?,.]{4,70})/i)) {
        setSeedLink(race, message.channel, message.author.username, message);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\bspaceballs\b)/i)) {
        spaceballs(race, message.channel);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\bstats\b)([ ]{0,1})([a-zA-Z 0-9%]{0,30})/i)) {
        stats(race, message.channel, message);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\bstreaming\b) ((\bon\b)|(\boff\b))/i)) {
        streaming(race, message.channel, message, message.author.username);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\bsubmit\b)(( "[a-zA-Z0-9%_ .]{3,30}"){3,18})( end)/i)) {
        submit(message.channel, message);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\btwitch\b) ([a-zA-Z0-9_]{4,20})/i)) {
        twitch(race, message.channel, message, message.author.username);
    } else if (message.channel.name === channel && message.content.match(/^[.!](\bunready\b)/i)) {
        unready(race, message.channel, message.author.username, message);
    }

    if (message && !message.author.bot) {
        message.delete().then().catch(console.error);
    }
};