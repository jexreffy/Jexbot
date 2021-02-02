const config = require('../config.json');
const newrace = require('../commands/new');
const leaderboard = require('../commands/leaderboard');
const rank = require('../commands/rank');
const twitch = require('../commands/twitch');
const streaming = require('../commands/streaming');
const join = require('../commands/join');
const close = require('../commands/close');
const leave = require('../commands/leave');
const ready = require('../commands/ready');
const unready = require('../commands/unready');
const done = require('../commands/done');
const forfeit = require('../commands/forfeit');
const offset = require('../commands/offset');
const reset = require('../commands/reset');
const stats = require('../commands/stats');
const submit = require('../commands/submit');
const tournament = require('../commands/tournament');
const kick = require('../commands/kick');
const setSeed = require('../commands/setSeed');

module.exports = (client, race, message) => {
    const channel = config.channel;

    if (message.channel.name === channel && message.content.match(/^[.!](\bleaderboard\b) ([ a-zA-Z0-9%]{3,20})/i)) {
        return leaderboard(message.channel, message);
    }
    if (message.channel.name === channel && message.content.match(/^[.!](\brank\b) ([ a-zA-Z0-9%]{3,20})/i)) {
        return rank(message.channel, message, message.author.username);
    }
    if (message.channel.name === channel && message.content.match(/^[.!](\btwitch\b) ([a-zA-Z0-9_]{4,20})/i)) {
        return twitch(race, message.channel, message, message.author.username);
    }
    if (message.channel.name === channel && message.content.match(/^[.!](\bstreaming\b) ((\bon\b)|(\boff\b))/i)) {
        return streaming(race, message.channel, message, message.author.username);
    }
    if (message.channel.name === channel && message.content.match(/^[.!]((\bstartrace\b)|(\bnew\b)|(\benter\b))([ ]{0,1})("[a-zA-Z0-9% ]{0,40}"){0,1}([ ]{0,1})([a-z]{0,10})(\b tournament\b){0,1}/i)) {
        return newrace(race, message.channel, message);
    }
    if (message.channel.name === channel && message.content.match(/^[.!]((\bclose\b)|(\bend\b)|(\bexit\b))/i)) {
        return close(race, message, message.channel);
    }
    if (message.channel.name === channel && message.content.match(/^[.!](\btournament\b)/i)) {
        return tournament(race, message.channel);
    }
    if (message.channel.name === channel && message.content.match(/^[.!]((\bjoin\b)|(\benter\b))/i)) {
        return join(race, message.channel, message.author.username, message);
    }
    if (message.channel.name === channel && message.content.match(/^[.!]((\bleave\b)|(\bunjoin\b))/i)) {
        return leave(race, message.channel, message.author.username, message);
    }
    if (message.channel.name === channel && message.content.match(/^[.!](\bready\b)/i)) {
        return ready(race, message.channel, message.author.username, message);
    }
    if (message.channel.name === channel && message.content.match(/^[.!](\bunready\b)/i)) {
        return unready(race, message.channel, message.author.username, message);
    }
    if (message.channel.name === channel && message.content.match(/^[.!]((\bdone\b)|(\btime\b))/i)) {
        return done(race, message.channel, message.author.username, message);
    }
    if (message.channel.name === channel && message.content.match(/^[.!](\bforfeit\b)|(\bff\b)/i)) {
        return forfeit(race, message.channel, message.author.username, message);
    }
    if (message.channel.name === channel && message.content.match(/^[.!](\boffset\b) (([0-9]+)|(\bpsx\b)|(\bxb\b))/i)) {
        return offset(race, message.channel, message);
    }
    if (message.channel.name === channel && message.content.match(/^[.!]((\breset\b)|(\brestart\b))/i)) {
        return reset(race, message.channel, message);
    }
    if (message.channel.name === channel && message.content.match(/^[.!](\bstats\b)([ ]{0,1})([a-zA-Z 0-9%]{0,30})/i)) {
        return stats(race, message.channel, message);
    }
    if (message.channel.name === channel && message.content.match(/^[.!](\bsubmit\b)(( "[a-zA-Z0-9%_ .]{3,30}"){3,18})( end)/i)) {
        return submit(message.channel, message);
    }
    if (message.channel.name === channel && message.content.match(/^[.!](\bkick\b)([ ]{0,1})([a-zA-Z0-9%]{0,20})/i)) {
        return kick(race, message.channel, message);
    }
    if (message.channel.name === channel && message.content.match(/^[.!](\bsetseed\b) (https:\/\/[a-zA-Z0-9_%\/?,.]{4,70})/i)) {
        return setSeed(race, message.channel, message.author.username, message);
    }
};