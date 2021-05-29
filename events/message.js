const config = require('../config.json');
const blueballs = require('../commands/blueballs');
const callback = require('../commands/callback');
const close = require('../commands/close')
const comment = require('../commands/comment');
const crew = require('../commands/crew');
const dick = require('../commands/dick');
const done = require('../commands/done');
const escape = require('../commands/escape');
const forfeit = require('../commands/forfeit');
const friday = require('../commands/friday');
const gatekeeper = require('../commands/gatekeeper');
const gtbk = require('../commands/gtbk');
const gtEnter = require('../commands/gtenter');
const gtGuess = require('../commands/gtguess');
const gtStart = require('../commands/gtstart');
const gtStop = require('../commands/gtstop');
const help = require('../commands/help');
const invitational = require('../commands/invitational');
const join = require('../commands/join');
const kick = require('../commands/kick');
const ladder = require('../commands/ladder');
const leaderboard = require('../commands/leaderboard');
const leave = require('../commands/leave');
const lock = require('../commands/lock');
const mode = require('../commands/mode');
const multiworld = require('../commands/multiworld');
const newRace = require('../commands/new');
const pb = require('../commands/pb');
const rank = require('../commands/rank');
const ready = require('../commands/ready');
const reset = require('../commands/reset');
const restream = require('../commands/restream');
const roll = require('../commands/roll');
const runners = require('../commands/runners');
const spaceballs = require('../commands/spaceballs');
const start = require('../commands/start');
const stats = require('../commands/stats');
const streaming = require('../commands/streaming');
const teams = require('../commands/teams');
const twitch = require('../commands/twitch');
const twitchBot = require('../commands/twitchbot');
const unready = require('../commands/unready');

function processDiscordCommand(db, dClient, tClient, message) {
    if (message.author.bot) return;

    const guildId = message.guild.id;

    const channel = config.guilds[guildId].channel;

    if (message.channel.name !== channel) {
        if (message.content.match(/(\byou know what that means\b)/i)) {
            friday(config, message.channel, message.author.username);
        }

        return;
    }

    const activeRace = db.getActiveRace();

    if (!activeRace) {
        let race = db.getRaceData(guildId);

        processDiscordInactiveCommands(dClient, tClient, config, db, race, message);

        db.setRaceData(guildId, race);
    } else if (guildId === activeRace) {
        let race = db.getRaceData(guildId);

        if (race.ladder) {
            processDiscordLadderCommands(dClient, tClient, config, db, race, message);
        } else if (race.started) {
            processDiscordRaceActiveCommands(dClient, tClient, config, db, race, message);
        } else {
            processDiscordRaceLobbyCommands(dClient, tClient, config, db, race, message);
        }

        db.setRaceData(guildId, race);
    } else {
        message.channel.send("**There is a race currently being run on another server.**");
    }

    if (message) {
        message.delete().then().catch(console.error);
    }
}

function processDiscordInactiveCommands(dClient, tClient, config, db, race, message) {
    if (message.content.match(/^[.!](\bcomment\b) ([ a-zA-Z0-9,./<>?;':"{}|`~!@#$%^&*()=_+]{0,1000})/i)) {
        comment(config, race, message.channel, message.author.username, message);
    } else if (message.content.match(/^[.!](\binvitational\b)/i)) {
        invitational(config, db, race, message.channel, message);
    } else if (message.content.match(/^[.!](\bladder\b) ([a-zA-Z0-9%]{4,20})/i)) {
        ladder(config, db, race, message.channel, message);
    } else if (message.content.match(/^[.!](\bleaderboard\b)/i)) {
        leaderboard(config, db, message.channel, message);
    } else if (message.content.match(/^[.!](\bnew\b)/i)) {
        newRace(config, db, race, message.channel, message);
    } else if (message.content.match(/^[.!](\bpb\b)/i)) {
        pb(config, db, message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\brank\b)/i)) {
        rank(config, db, message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\broll\b)/i)) {
        roll(config, db, null, message.channel, message);
    } else if (message.content.match(/^[.!](\bspaceballs\b)/i)) {
        spaceballs(config, db, race, message.channel, tClient);
    } else if (message.content.match(/^[.!](\bstats\b)/i)) {
        stats(config, db, race, message.channel, message);
    }
}

function processDiscordLadderCommands(dClient, tClient, config, db, race, message) {
    if (message.content.match(/^[.!](\bclose\b)/i)) {
        close(config, db, race, message.channel, message.author.username);
    }
}

function processDiscordRaceActiveCommands(dClient, tClient, config, db, race, message) {
    if (message.content.match(/^[.!](\bblueballs\b) ([0-9]{1,2})/i)) {
        blueballs(race, message.content);
    } else if (message.content.match(/^[.!](\bclose\b)/i)) {
        close(config, db, race, message.channel, message.author.username);
    } else if (message.content.match(/^[.!](\bcomment\b) ([ a-zA-Z0-9,./<>?;':"{}|`~!@#$%^&*()=_+]{0,1000})/i)) {
        comment(config, race, message.channel, message.author.username, message);
    } else if (message.content.match(/^[.!](\bdick\b)/i)) {
        dick(config, db, race, message.channel, tClient);
    } else if (message.content.match(/^[.!](\bdone\b)/i)) {
        done(config, db, race, message.channel, tClient, message.author.username, message);
    } else if (message.content.match(/^[.!](\bescape\b) ([a-zA-Z0-9<>:]{4,100})/i)) {
        escape(config, db, race, message.channel, message);
    } else if (message.content.match(/^[.!](\bforfeit\b)|(\bff\b)/i)) {
        forfeit(config, db, race, message.channel, tClient, message.author.username, message);
    } else if (message.content.match(/^[.!](\bgtguess\b) ([0-9]{1,2})/i)) {
        gtGuess(config, race, message.channel, tClient, null, message.author.username, message.content);
    } else if (message.content.match(/^[.!](\bkick\b) ([a-zA-Z0-9%]{0,20})/i)) {
        kick(config, db, race, message.channel, tClient, message);
    } else if (message.content.match(/^[.!](\bspaceballs\b)/i)) {
        spaceballs(config, db, race, message.channel, tClient);
    }
}

function processDiscordRaceLobbyCommands(dClient, tClient, config, db, race, message) {
    if (message.content.match(/^[.!](\bclose\b)/i)) {
        close(config, db, race, message.channel, message.author.username);
    } else if (message.content.match(/^[.!](\bcrew\b)/i)) {
        crew(config, db, race, message.channel, message.author.username, null, null);
    } else if (message.content.match(/^[.!](\bgatekeeper\b)/i)) {
        gatekeeper(config, db, race, message.channel, message.author.username);
    } else if (message.content.match(/^[.!](\bjoin\b)/i)) {
        join(config, db, race, message.channel, message.author.username, message);
    } else if (message.content.match(/^[.!](\bkick\b) ([a-zA-Z0-9%]{0,20})/i)) {
        kick(config, db, race, message.channel, tClient, message);
    } else if (message.content.match(/^[.!](\bleaderboard\b)/i)) {
        leaderboard(config, db, message.channel, message);
    } else if (message.content.match(/^[.!](\bleave\b)/i)) {
        leave(config, db, race, message.channel, message.author.username, message);
    } else if (message.content.match(/^[.!](\block\b)/i)) {
        lock(config, db, race, message.channel, message.author.username);
    } else if (message.content.match(/^[.!](\bmultiworld\b) (https:\/\/[a-zA-Z0-9_%\/?,.]{4,200})/i)) {
        multiworld(config, db, race, message.channel, message.author.username, message);
    } else if (message.content.match(/^[.!](\bpb\b)/i)) {
        pb(config, db, message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\brank\b)/i)) {
        rank(config, db, message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\bready\b)/i)) {
        ready(config, db, race, message.channel, message.author.username);
    } else if (message.content.match(/^[.!](\breset\b)/i)) {
        reset(config, db, race, message.channel, message);
    } else if (message.content.match(/^[.!](\brestream\b) ((\bon\b)|(\boff\b))/i)) {
        restream(config, db, race, message.channel, message);
    } else if (message.content.match(/^[.!](\broll\b)/i)) {
        roll(config, db, race, message.channel, message);
    } else if (message.content.match(/^[.!](\bspaceballs\b)/i)) {
        spaceballs(config, db, race, message.channel, tClient);
    } else if (message.content.match(/^[.!](\bstart\b)/i)) {
        start(config, db, race, message.channel, message.author.username);
    } else if (message.content.match(/^[.!](\bstats\b)/i)) {
        stats(config, db, race, message.channel, message);
    } else if (message.content.match(/^[.!](\bstreaming\b) ((\bon\b)|(\boff\b))/i)) {
        streaming(db, race, message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\bcoop\b)/i)) {
        teams(config, db, race, message.channel, message.author.username, true);
    } else if (message.content.match(/^[.!](\bteams\b)/i)) {
        teams(config, db, race, message.channel, message.author.username, false);
    } else if (message.content.match(/^[.!](\btwitch\b) ([a-zA-Z0-9_]{4,30})/i)) {
        twitch(db, race, message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\btwitchbot\b) ((\bon\b)|(\boff\b))/i)) {
        twitchBot(db, race, message.channel, message, message.author.username);
    } else if (message.content.match(/^[.!](\bunready\b)/i)) {
        unready(db, race, message.channel, message.author.username, message);
    }
}

function processTwitchCommand(db, dClient, tClient, tChannel, tags, message, self) {
    if (self) return;

    const guildId = db.getActiveRace();
    let race = db.getRaceData(guildId);

    let dChannel = dClient.channels.cache.find(channel => channel.name === config.guilds[guildId].channel);

    if (race.ladder) {
        processTwitchLadderCommands(dChannel, tClient, tChannel, config, db, race, tags, message);
    } else {
        processTwitchRaceActiveCommands(dChannel, tClient, tChannel, config, db, race, tags, message);
    }

    db.setRaceData(guildId, race);
}

function processTwitchLadderCommands(dChannel, tClient, tChannel, config, db, race, tags, message) {
    if (message.match(/^[.!](\bblueballs\b) ([0-9]{1,2})/i)) {
        blueballs(race, tClient, tChannel, message);
    } else if (message.match(/^[.!](\bgtbk\b) ([0-9]{1,2})/i)) {
        gtbk(config, race, dChannel, tClient, tChannel, message);
    } else if (message.match(/^[.!](\bgtguess\b) ([0-9]{1,2})/i)) {
        gtGuess(config, race, dChannel, tClient, tChannel, tags.username, message);
    } else if (message.match(/^[.!](\bgtstart\b)/i)) {
        gtStart(config, race, tClient, tChannel);
    } else if (message.match(/^[.!](\bgtstop\b)/i)) {
        gtStop(config, race, tClient, tChannel);
    } else if (message.match(/^[!](\bhelp\b)/i)) {
        help(config, race, tClient, tChannel);
    } else if (message.match(/^[!](\bmode\b)/i)) {
        mode(config, race, tClient, tChannel);
    } else if (message.match(/^[!](\bspaceballs\b)/i)) {
        spaceballs(config, db, race, dChannel, tClient);
    }
}

function processTwitchRaceActiveCommands(dChannel, tClient, tChannel, config, db, race, tags, message) {
    if (message.match(/^[.!](\bblueballs\b) ([0-9]{1,2})/i)) {
        blueballs(race, tClient, tChannel, message);
    } else if (message.match(/^[!](\bcallback\b)/i)) {
        callback(config, race, dChannel, tClient, tChannel);
    } else if (message.match(/^[.!](\bcrew\b)/i)) {
        crew(config, db, race, null, null, tClient, tChannel);
    } else if (message.match(/^[!](\bdick\b)/i)) {
        dick(config, db, race, dChannel, tClient);
    } else if (message.match(/^[.!](\bgtbk\b) ([0-9]{1,2})/i)) {
        gtbk(config, race, dChannel, tClient, tChannel, message);
    } else if (message.match(/^[.!](\bgtenter\b)/i)) {
        gtEnter(config, race, tClient, tChannel);
    } else if (message.match(/^[.!](\bgtguess\b) ([0-9]{1,2})/i)) {
        gtGuess(config, race, dChannel, tClient, tChannel, tags.username, message);
    } else if (message.match(/^[.!](\bgtstart\b)/i)) {
        gtStart(config, race, tClient, tChannel);
    } else if (message.match(/^[.!](\bgtstop\b)/i)) {
        gtStop(config, race, tClient, tChannel);
    } else if (message.match(/^[!](\bhelp\b)/i)) {
        help(config, race, tClient, tChannel);
    } else if (message.match(/^[!](\bmode\b)/i)) {
        mode(config, race, tClient, tChannel);
    } else if (message.match(/^[.!](\brunners\b)/i)) {
        runners(config, race, tClient, tChannel);
    } else if (message.match(/^[!](\bspaceballs\b)/i)) {
        spaceballs(config, db, race, dChannel, tClient);
    }
}

module.exports = (...args) => {
    if (args.length === 4) {
        processDiscordCommand(args[0], args[1], args[2], args[3]);
    } else if (args.length === 7) {
        processTwitchCommand(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
    }
};