const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, username) => {
    if (config.referees.includes(username)) {
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
            race.status = 'RESTARTED PRE-RACE: WAITING FOR PLAYERS TO JOIN';
            updateRaceMessage(db, race, dChannel);
        }
    }
};