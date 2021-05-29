const onRunnerAdded = require('../common/onRunnerAdded');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, username, message) => {
    let playerToAdd = null;
    let teamToAdd = null;

    if (race.invitational && config.referees.includes(username)) {
        let match = message.content.match(race.teams ? /^[.!](\bjoin\b) ([a-zA-Z0-9]{4,30}) ((1)|(2))/i : /^[.!](\bjoin\b) ([a-zA-Z0-9]{4,30})/i);

        if (match) {
            playerToAdd = match[2];
            if (race.teams) teamToAdd = parseInt(match[3]) - 1;
        }
    } else if (!(race.invitational || race.locked)) {
        playerToAdd = username;
    }

    if (playerToAdd) {
        let player = race.players.find(x => x.username === playerToAdd);

        if (!(race.started || race.finished || player)) {
            if (!race.invitational) race.teams = false;

            let newPlayer = {
                username: playerToAdd
            };

            if (teamToAdd) newPlayer.team = teamToAdd;

            onRunnerAdded(config, db, race, newPlayer, message);
            updateRaceMessage(db, race, dChannel);
        }
    }
};