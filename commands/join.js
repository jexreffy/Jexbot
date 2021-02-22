const newRace = require('../commands/new');
const onRunnerAdded = require('../common/onRunnerAdded');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, race, dChannel, username, message) => {
    let player = race.players.find(x => x.username === username);

    if (race.finished) {
        let newPlayer = {
            id: message.author.id,
            username: username
        };

        newRace(config, race, dChannel, message).then(() => {
            onRunnerAdded(config, race, newPlayer, message);
            updateRaceMessage(race, dChannel);
        }).catch(console.error);
    } else if ((!race.started && !player)) {
        let newPlayer = {
            id: message.author.id,
            username: username
        };

        onRunnerAdded(config, race, newPlayer, message);
        updateRaceMessage(race, dChannel);
    }
};