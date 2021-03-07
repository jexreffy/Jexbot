const newRace = require('../commands/new');
const onRunnerAdded = require('../common/onRunnerAdded');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, race, dChannel, username, message) => {
    let player = race.players.find(x => x.username === username);

    if (!(race.started || race.finished || player)) {
        let newPlayer = {
            id: message.author.id,
            username: username
        };

        onRunnerAdded(config, race, newPlayer, message);
        updateRaceMessage(race, dChannel);
    }
};