const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, race, dChannel, message) => {
    if (race.finished || (message.member && message.member.hasPermission('KICK_MEMBERS', false, false)) || config.referees.includes(message.author.username)) {
        return new Promise((resolve, reject) => {
            race.started = false;
            race.finished = false;
            race.startedAt = null;
            race.initiatedAt = Date.now();
            race.escapeItem = null;
            race.lastHello = null;
            race.pingIndex = Math.floor(Math.random() * Math.floor(config.pings.length));
            race.countdownIndex = Math.floor(Math.random() * Math.floor(config.countdowns.length));
            race.remainingPlayers = 0
            race.players = [];
            race.lastCallback = null;
            race.blueballs = -1;
            race.guessGameStarted = false;
            race.guesses = [];
            race.gtRunner = null;
            race.gtbk = -1;
            race.gtbkWinner = null;
            race.gtbkWinnerAnnounced = false;
            race.gtbkGuess = -1;
            race.gatekeeper = null;
            race.category = config.defaultCategory;
            race.messageId = null;
            race.seedCode = null;
            race.seedLink = null;
            race.seedRoller = null;
            race.mutlistream = 'https://multistre.am/';
            race.status = 'PRE-RACE: WAITING FOR PLAYERS';
            race.lastDickTime = null;
            race.dickCount = 0;

            for (let i = 0; i < 22; i++) {
                race.guesses.push(null);
            }

            let embed = {
                'content': "",
                'embed': {
                    'color': 65280,
                    'title': 'Crystal Company Race'
                }
            };

            let role = message.guild.roles.cache.find(r => r.name === config.pingRole);

            dChannel.send(`${role} ${config.pings[race.pingIndex]}`);
            dChannel.send(embed).then(x => {
                race.messageId = x.id;
                updateRaceMessage(race, dChannel);
                resolve();
            }).catch((error) => {
                console.log(error);
                reject('Failed!');
            });
        });
    }
};