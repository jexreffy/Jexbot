const config = require('../config.json');
const updateRaceMessage = require('../common/updateRaceMessage');
const Discord = require('discord.js');

module.exports = (race, channel, message) => {
    if (race.finished || (message.member && message.member.hasPermission('KICK_MEMBERS', false, false)) || config.referees.includes(message.author.username)) {
        if ((Math.floor(((new Date().getTime()) - race.initiatedAt)) / (1000 * 60)) > parseInt(config.minimumNewIntervalMinutes)) {
            race.started = false;
            race.finished = false;
            race.startedAt = null;
            race.remainingPlayers = 0;
            race.category = config.defaultCategory;
            race.players = [];
            race.mutlistream = 'https://multistre.am/';
            race.status = 'PRE-RACE: WAITING FOR PLAYERS';
    
            return new Promise((resolve, reject) => {
                race.initiatedAt = new Date().getTime();
                race.pingIndex = Math.floor(Math.random() * Math.floor(config.pings.length));
                race.countdownIndex = Math.floor(Math.random() * Math.floor(config.countdowns.length));
                let embed = {
                    'content': "",
                    'embed': {
                        'color': 65280,
                        'title': 'Crystal Company Race'
                    }
                };

                let role = message.guild.roles.cache.find(r => r.name === config.pingRole);

                channel.send(`${role} ${config.pings[race.pingIndex]}`);
                channel.send(embed).then(x => {
                    race.messageId = x.id;
                    updateRaceMessage(race, channel);
                    resolve();
                }).catch((error) => {
                    console.log(error);
                    reject('Failed!');
                });
            });
        }
    }
};