const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (race, dChannel, message) => {
    if (message.member && message.member.hasPermission('KICK_MEMBERS', false, false)) {
        if (!race.finished) {
            race.started = false;
            race.startedAt = null;
            race.initiatedAt = Date.now();
            race.remainingPlayers = race.players.length;
            race.players.forEach(x => {
                x.finished = false;
                x.forfeited = false;
                x.ready = false;
                x.time = null;
            });
            race.status = 'RESTARTED PRE-RACE: WAITING FOR PLAYERS';
            updateRaceMessage(race, dChannel);
        }
    }
};