'use strict'
module.exports = (race) => {
    race.ladder = false;
    race.invitational = false;
    race.teams = false;
    race.multiworld = false;
    race.locked = false;
    race.relay = false;
    race.started = false;
    race.finished = false;
    race.connected = false;
    race.startedAt = null;
    race.initiatedAt = Date.now();
    race.escapeItem = null;
    race.lastHello = null;
    race.pingIndex = -1;
    race.countdownIndex = -1;
    race.remainingPlayers = 0;
    race.players = [];
    race.crew = [];
    race.lastCallback = null;
    race.blueballs = -1;
    race.guessGameEnabled = false;
    race.guessGameStarted = false;
    race.guessGameFinished = false;
    race.gtRunner = null;
    race.gtbk = -1;
    race.gtbkWinner = null;
    race.spoilersAllowed = false;
    race.gtbkGuess = -1;
    race.gatekeeper = null;
    race.category = '';
    race.categoryName = '';
    race.categoryDescription = '';
    race.messageId = null;
    race.seedCode = null;
    race.seedLink = null;
    race.seedRoller = null;
    race.multistream = '';
    race.restream = null;
    race.status = '';
    race.lastDickTime = null;
    race.dickCount = 0;

    race.guesses = [];
    race.legs = [];
    race.legStartTime = [];

    for (let i = 0; i < 22; i++) {
        race.guesses.push(null);
    }
}