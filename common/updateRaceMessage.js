const data = require('../data/data.js')

module.exports = (race, channel) => {
    let message = {};
    let embed = {};
    embed.color = 65280;
    embed.title = race.status;

    let desc = "The Legend of Zelda: A Link to the Past Randomizer Friday Night Standard Race"

    if (race.seed) {
        desc += "\n Seed: " + race.seed;
    }

    if (race.mutlistream) {
        desc += "\n Multistream: <" + race.mutlistream + ">";
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

    let commands = "";
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

    if (race.started) {
        commands = "Prefixes: `.` or `!`" +
            "\n.done/.time - Finishes the race for the player" +
            "\n.f - Forfeits the race for the player";
    } else {
        commands = "Prefixes: `.` or `!`" +
            "\n.join- Joins the current race" +
            "\n.leave - Leaves the current race" +
            "\n.ready - Sets player ready to start" +
            "\n.unready - Sets player not ready to start" +
            "\n.setseed {URL} - Sets the seed for the Race" +
            "\n.streaming {on|off} - Sets if the player is streaming the race and should be included in the Multistream" +
            "\n.twitch {insert Twitch username} - Change stream URL to your Twitch username if different from your Discord username";
    }

    embed.fields = [
        {'name': 'Commands', 'value': commands, 'inline': false},
        {'name': 'Player', 'value': names, 'inline': true},
        {'name': 'Status', 'value': status, 'inline': true},
        {'name': 'Time', 'value': times, 'inline': true},
    ];

    message = {
        'content': "",
        'embed': embed
    }

    const raceMessage = channel.fetchMessage(race.messageId).then(x =>
        x.edit(message).then().catch(console.error)).catch(console.error);
    return;
};