const config = require('../config.json');
const updateRaceMessage = require('../common/updateRaceMessage');
const data = require('../data/data.js');

module.exports = (race, dChannel, tClient, tChannel, username, message) => {
    if ((Math.floor(((new Date().getTime()) - race.startedAt)) / 1000) > config.minimumGuessStartSeconds) {
        let match = message.match(/^[.!](\bguess\b) ([0-9]{1,2})/i);
        let guess = parseInt(match[2]);

        if (guess < 1 || guess > 22) return;

        let response = null;

        if (race.guesses[guess]) {
            if (tChannel) {
                tClient.say(tChannel, `${race.guesses[guess]} has already guessed ${guess} for the GTBK Guessing Game.`);
            } else {
                dChannel.send(response);
            }
        } else {
            race.guesses[guess] = username;
            let response = `${username} has guessed ${guess} for the GTBK Guessing Game.`;

            for (let i = 0; i < config.twitchChannels.length; i++) {
                tClient.say(`#${config.twitchChannels[i]}`, response);
            }

            dChannel.send(response);
        }
    }
};