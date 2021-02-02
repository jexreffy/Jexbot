const config = require('../config.json');
const updateRaceMessage = require('../common/updateRaceMessage');
const Discord = require('discord.js');

module.exports = (race, channel, message) => {
    if (race.finished ||(race.tournament && message.member && message.member.hasPermission('KICK_MEMBERS', false, false)) || config.referees.includes(message.author.username) || race.tournament == false) {
        if ((Math.floor(((new Date().getTime()) - race.initiatedAt)) / (1000 * 60)) > parseInt(config.minimumNewIntervalMinutes)) {
            let match = message.content.match(/^[.!]((\bstartrace\b)|(\bnew\b)|(\bjoin\b)|(\benter\b))([ ]{0,1})("[a-zA-Z0-9% ]{0,40}"){0,1}([ ]{0,1})([a-z]{0,10})(\b tournament\b){0,1}/i);
            let offset = match[9];
            let offsets = config.offsets;
            if (message && message.content.match(/^[.!]((\bstartrace\b)|(\bnew\b))/i)) {
                message.delete().then().catch(console.error);
            }

            race.offset = parseInt(config.defaultOffset);
            if (offset) {
                for (let i = 0; i < config.offsets.length; i++) {
                    if (offset == offsets[i].alias) {
                        race.offset = offsets[i].value * 1000;
                    }
                }
            }

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
                let embed = {
                    'content': "Let's get ready to Rando!!!",
                    'embed': {
                        'color': 65280,
                        'title': 'Crystal Company Race'
                    }
                };
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
    if (message && message.content.match(/^[.!]((\bstartrace\b)|(\bnew\b))/i)) {
        message.delete().then().catch(console.error);
    }
    return;
};