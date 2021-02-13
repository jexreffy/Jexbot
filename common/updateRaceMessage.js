const config = require('../config.json');
const data = require('../data/data.js');

module.exports = (race, channel) => {
    let message = {};
    let embed = {};
    embed.color = 65280;
    embed.title = race.status;

    let desc = "The Legend of Zelda: A Link to the Past Randomizer Race"

    if (race.gatekeeper) {
        desc += `\n Gatekeeper: ${race.gatekeeper}`;
    }

    if (race.seedLink) {
        desc += `\n Seed: <${race.seedLink}>`;
    }

    if (race.seedCode) {
        desc += `\n Code: ${race.seedCode}`;
    }

    if (race.mutlistream) {
        desc += `\n Multistream: <${race.mutlistream}>`;
    }

    embed.description = desc;

    race.players.sort(function(a, b) {
        if (a.time == null) {
            if (b.time) {
                return 1;
            }
        }
        if (b.time == null) {
            if (a.time) {
                return -1;
            }
        }
        if (b.forfeited) {
            if (!a.forfeited) {
                return 1;
            }
        }
        if (a.forfeited) {
            if (!b.forfeited) {
                return -1;
            }
        }
        if (a.time > b.time) {
            return 1;
        }
        if (a.time === b.time) {
            return 0;
        }
        if (a.time < b.time) {
            return -1;
        }
        return 0;
    });

    let names = "";
    let status = "";
    let times = "";
    if (race.players.length > 0) {
        for (let i = 0; i < race.players.length; i++) {
            let username = race.players[i].username;

            if (data.getPlayerStreaming(username)) {
                let userTwitch = data.getPlayerTwitch(username);
                if (!userTwitch) {
                    userTwitch = username;
                }

                names += ((i !== 0) ? '\n' : '') + "[" + userTwitch + "](https://twitch.tv/" + userTwitch + ")";
            } else {
                names += ((i !== 0) ? '\n' : '') + username;
            }

            if (race.players[i].time) {
                let time = race.players[i].time;
                let seconds = Math.floor((time / 1000) % 60);
                let minutes = Math.floor((time / (1000 * 60)) % 60);
                let hours = Math.floor((time / (1000 * 60 * 60)) % 24);
                status += ((i !== 0) ? '\n' : '') + 'Finished';
                times += ((i !== 0) ? '\n' : '') + (i + 1) + ". " + hours.toString().padStart(2, "0") + ':' + minutes.toString().padStart(2, "0") + ':' + seconds.toString().padStart(2, "0");
            } else if (race.players[i].forfeited) {
                status += ((i !== 0) ? '\n' : '') + 'Forfeit';
                times += ((i !== 0) ? '\n' : '') + 'DNF';
            } else if (race.players[i].ready) {
                status += ((i !== 0) ? '\n' : '') + 'Ready';
                times += ((i !== 0) ? '\n' : '') + '---';
            } else {
                status += ((i !== 0) ? '\n' : '') + 'Not Ready';
                times += ((i !== 0) ? '\n' : '') + '---';
            }
        }
    } else {
        names = "N/A";
        status = "---";
        times = "---";
    }

    let racerCommands = "";
    let viewerCommands = "";
    if (race.started) {
        racerCommands = "Prefixes: `.` or `!`" +
            "\n`.done` - Finishes the race for the player" +
            "\n`.ff` - Forfeits the race for the player";

        viewerCommands = "Prefixes: `.` or `!`" +
            "\n`.dick` - Increments the counter of times the seed roller is blamed for the seed" +
            "\n`.spaceballs` - Resets the clock since the last Spaceballs reference";
    } else {
        racerCommands = "Prefixes: `.` or `!`" +
            "\n`.join` - Joins the current race" +
            "\n`.leave` - Leaves the current race" +
            "\n`.ready` - Sets player ready to start" +
            "\n`.unready` - Sets player not ready to start" +
            "\n`.setseedlink {URL}` - Sets the seed url for the Race" +
            "\n`.setseedcode {Emote 1} {Emote 2} {Emote 3} {Emote 4} {Emote 5}` - Sets the seed code via Emotes for the Race" +
            "\n`.streaming {on|off}` - Sets if the player is streaming the race and should be included in the Multistream" +
            "\n`.twitch {Twitch username}` - Change stream URL to your Twitch username if different from your Discord username";

        viewerCommands = "Prefixes: `.` or `!`" +
            "\n`.spaceballs` - Resets the clock since the last Spaceballs reference";
    }

    const time = data.getSpaceballs();
    let dt = new Date(time);
    let spaceTime = `${(dt.getMonth()+1).toString().padStart(2, '0')}/${
                        dt.getDate().toString().padStart(2, '0')}/${
                        dt.getFullYear().toString().padStart(4, '0')} ${
                        dt.getHours().toString().padStart(2, '0')}:${
                        dt.getMinutes().toString().padStart(2, '0')}:${
                        dt.getSeconds().toString().padStart(2, '0')}`;

    embed.fields = [
        {'name': 'Racer Commands', 'value': racerCommands, 'inline': false},
        {'name': 'Viewer Commands', 'value': viewerCommands, 'inline': false},
        {'name': 'Last Spaceballs Reference', 'value': spaceTime, 'inline': false},
        {'name': 'Dick Counter', 'value': `${race.dickCount}`, 'inline': false},
        {'name': 'Player', 'value': names, 'inline': true},
        {'name': 'Status', 'value': status, 'inline': true},
        {'name': 'Time', 'value': times, 'inline': true},
    ];

    message = {
        'content': "",
        'embed': embed
    }

    channel.messages.fetch(race.messageId).then(x => x.edit(message).then().catch(console.error)).catch(console.error);
};