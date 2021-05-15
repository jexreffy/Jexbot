const onRunnerAdded = require('../common/onRunnerAdded');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, username, message) => {
    let player = race.players.find(x => x.username === username);

    if (!(race.started || race.finished || player)) {
        let newPlayer = {
            id: message.author.id,
            username: username
        };

        onRunnerAdded(config, db, race, newPlayer, message);
        updateRaceMessage(db, race, dChannel);
    }
};