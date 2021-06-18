'use strict'
module.exports = (app, context) => {
    let race = context.activeRace;

    let message = {};
    let embed = {};
    embed.color = 65280;
    embed.title = race.status;

    let desc = "The Legend of Zelda: A Link to the Past Randomizer Race"

    if (race.categoryName) {
        desc += `\n Category: ${race.categoryName}`;
    }

    if (race.gatekeeper) {
        desc += `\n Gatekeeper: ${race.gatekeeper}`;
    }

    if (race.relay) {
        for (let i = 0; i < race.legs.length; i++) {
            desc += `\n Leg ${i + 1} Category: ${race.legs[i].name}`;
            desc += `\n Leg ${i + 1} Seed: ${race.legs[i].link}`;
            desc += `\n Leg ${i + 1} Code: ${race.legs[i].code}`;
        }
    } else {
        if (race.seedLink) {
            desc += `\n Race Seed: ${race.seedLink}`;
        }

        if (race.seedCode) {
            desc += `\n Seed Code: ${race.seedCode}`;
        }

        if (race.seedRoller) {
            desc += `\n Rolled By: ${race.seedRoller}`;
        }
    }

    if (race.restream) {
        desc += `\n Restream: <https://twitch.tv/${race.restream.substr(1)}>`;
    } else if (race.mutlistream) {
        desc += `\n Multistream: <${race.mutlistream}>`;
    }

    if (race.escapeItem) {
        desc += `\n Escape Item: ${race.escapeItem}`;
    }

    if (race.crew.length > 0) {
        let crew = "";
        for (let i = 0; i < race.crew.length; i++) {
            crew += ((i !== 0) ? ' ' : '') + race.crew[i].username;
        }
        desc += `\n Crew: ${crew}`;
    }

    if (race.invitational && race.finished || !race.invitational && race.remainingPlayers <= race.players.length / 2) {
        if (race.blueballs >= 0) {
            desc += `\n Aga 1 Blue Balls: ${race.blueballs}`;
        }

        if (race.gtbk >= 0) {
            desc += `\n GTBK Guessing Game Location: ${race.gtRunner.replace('#', '')} Check ${race.gtbk}`;
            desc += `\n GTBK Guessing Game Winner: ${race.gtbkWinner} guessed ${race.gtbkGuess}`;
        }
    }

    embed.description = desc;

    app.routines["sortPlayers"](race.players, race.teams, race.relay);

    let names = "";
    let status = "";
    if (race.players.length > 0) {
        for (let i = 0; i < race.players.length; i++) {
            if (race.teams && i === 0) {
                names += `---Team ${race.players[i].team + 1}---\n`;
                status += `----------\n`;
            } else if (race.teams && i > 0 && race.players[i - 1].team < race.players[i].team) {
                names += `\n---Team ${race.players[i].team + 1}---`;
                status += `\n----------`;
            }

            let username = race.players[i].username;

            if (app.db.getPlayerStreaming(username)) {
                let userTwitch = app.db.getPlayerTwitch(username);
                if (!userTwitch) {
                    userTwitch = username;
                }

                names += `${((i !== 0) ? '\n' : '')}[${username}](https://twitch.tv/"${userTwitch}) ${(!race.invitational && app.db.getPlayerTwitchBot(username) ? ' :robot:' : '')}`;
            } else {
                names += `${((i !== 0) ? '\n' : '')}${username}`;
            }

            if (race.players[i].time) {
                status += `${((i !== 0) ? '\n' : '')}${(!race.teams ? (i + 1) + '. ' : '')}${app.routines["getRaceTime"](race.players[i].time)}`;
            } else if (race.players[i].forfeited) {
                status += `${((i !== 0) ? '\n' : '')}DNF`;
            } else if (race.players[i].ready) {
                status += `${((i !== 0) ? '\n' : '')}Ready`;
            } else {
                status += `${((i !== 0) ? '\n' : '')}Not Ready`;
            }
        }
    } else {
        names = "N/A";
        status = "---";
    }

    let racerCommands = "";
    let viewerCommands = "";
    if (race.started) {
        racerCommands = "Prefixes: `.` or `!`" +
            "\n`.done` - Finishes the race for the player" +
            "\n`.ff` - Forfeits the race for the player";

        viewerCommands = "Prefixes: `.` or `!`" +
            "\n`.blueballs [0-15]` - Sets the number of blue balls Aga 1 threw" +
            "\n`.dick` - Increments the counter of times the seed roller is blamed for the seed" +
            "\n`.escape {Emote}` - Sets the item Uncle gave the runners in the Escape sequence";

        if (race.guessGameStarted) viewerCommands += "\n`.gtguess [1-22]` - Sets your guess for the GTBK Guessing Game";

        viewerCommands += "\n`.spaceballs` - Resets the clock since the last Spaceballs reference";
    } else {
        racerCommands = "Prefixes: `.` or `!`" +
            "\n`.join` - Joins the current race" +
            "\n`.leave` - Leaves the current race" +
            "\n`.ready` - Sets player ready to start" +
            "\n`.unready` - Sets player not ready to start" +
            "\n`.roll` - Only type this if your self esteem can handle it, or understand how Random Number Generators work..." +
            "\n`.streaming {on|off}` - Sets if the player is streaming the race and should be included in the Multistream" +
            "\n`.twitch {Twitch username}` - Change stream URL to your Twitch username if different from your Discord username";

        if (!race.invitational) racerCommands += "\n`.twitchBot {on|off}` - Sets if JexBot connects to the Player's Twitch stream" ;

        viewerCommands = "Prefixes: `.` or `!`" +
            "\n`.spaceballs` - Resets the clock since the last Spaceballs reference";
    }

    const time = app.db.getSpaceballs();
    let dt = new Date(time);
    let spaceTime = `${dt.toLocaleString('en-US', { timeZone: 'America/New_York' })}`;

    embed.fields = [
        {'name': 'Racer Commands', 'value': racerCommands, 'inline': false},
        {'name': 'Viewer Commands', 'value': viewerCommands, 'inline': false},
        {'name': 'Last Spaceballs Reference', 'value': spaceTime, 'inline': false},
        {'name': 'Dick Counter', 'value': `${race.dickCount}`, 'inline': false},
        {'name': 'Player', 'value': names, 'inline': true},
        {'name': 'Status', 'value': status, 'inline': true}
    ];

    message = {
        'content': "",
        'embed': embed
    }

    app.findDiscordMessage(context.guildId, context.activeRace.messageId).then(x => {
        x.edit(message).then().catch(console.error)
    }).catch(console.error);
};