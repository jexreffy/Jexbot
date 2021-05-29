const getRandom = require('../common/getRandom');
const updateRaceMessage = require('../common/updateRaceMessage');

module.exports = (config, db, race, dChannel, username, coop) => {
    if (!race.started && config.referees.includes(username)) {
        if (race.invitational && race.players.length <= 0) {
            race.teams = true;
            updateRaceMessage(db, race, dChannel);
            return;
        } else if (coop && race.players.length % 2 !== 0) {
            dChannel.send(`**${config.teamPlayerError.replace('Teams', 'Co-op')}**`).then().catch(console.error);
            return;
        } else if (!coop && (race.players.length > config.teamPlayers.length || config.teamPlayers[race.players.length] <= 0)){
            dChannel.send(`**${config.teamPlayerError}**`).then().catch(console.error);
            return;
        }

        race.teams = true;

        let playerCount = coop ? 2 : config.teamPlayers[race.players.length];
        let teamCount = race.players.length / playerCount;

        let currentTeam = 0;
        let currentTeamCount = 0;
        let playersUsed = [];

        do {
            let i = getRandom(race.players.length);
            if (playersUsed.indexOf(i) < 0) {
                playersUsed.push(i);

                race.players[i].team = currentTeam;
                if (++currentTeamCount >= playerCount) {
                    currentTeam++;
                    currentTeamCount = 0;
                }
            }
        } while (playersUsed.length < race.players.length);

        dChannel.send(`**${config.teamGenerated}**`).then().catch(console.error);
        updateRaceMessage(db, race, dChannel);
    }
}