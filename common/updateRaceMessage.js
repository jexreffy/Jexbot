module.exports = (race, channel) => {
    let message = {};
    let embed = {};
    embed.color = 65280;
    embed.title = race.status;

    let desc = "The Legend of Zelda: A Link to the Past Randomizer Friday Night Standard Race"

    if (race.seed) {
        desc += "\n Seed: " + race.seed;
    }

    if (race.kadgar) {
        desc += "\n Multistream: <" + race.kadgar + ">";
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

    if (race.players.length > 0) {
        let names = "";
        let status = "";
        let times = "";
        for (let i = 0; i < race.players.length; i++) {
            names += ((i !== 0) ? '\n' : '') + race.players[i].username;

            if (race.players[i].time) {
                let time = race.players[i].time;
                let seconds = Math.floor((time / 1000) % 60);
                let minutes = Math.floor((time / (1000 * 60)) % 60);
                let hours = Math.floor((time / (1000 * 60 * 60)) % 24);
                status += ((i !== 0) ? '\n' : '') + 'Finished';
                times += ((i !== 0) ? '\n' : '') + hours.toString().padStart(2, "0") + ':' + minutes.toString().padStart(2, "0") + ':' + seconds.toString().padStart(2, "0");
            } else if (race.players[i].forfeited) {
                status += ((i !== 0) ? '\n' : '') + 'Forfeit';
                times += ((i !== 0) ? '\n' : '') + '---';
            } else if (race.players[i].ready) {
                status += ((i !== 0) ? '\n' : '') + 'Ready';
                times += ((i !== 0) ? '\n' : '') + '---';
            } else {
                status += ((i !== 0) ? '\n' : '') + 'Not Ready';
                times += ((i !== 0) ? '\n' : '') + '---';
            }
        }

        let commands = "";
        if (race.started) {
            commands = "Prefixes: `.` or `!`" +
                       "\n.done/.time/Emote 🏁 - Finishes the race for the player" +
                       "\n.forfeit/.ff/Emote ❌ - Forfeits the race for the player";
        } else {
            commands = "Prefixes: `.` or `!`" +
                "\n.join/Emote ➕ - Joins the current race" +
                "\n.leave/Unemote ➕ - Leaves the current race" +
                "\n.ready/Emote ✅ - Sets player ready to start" +
                "\n.unready/Unemote ✅ - Sets player not ready to start" +
                "\n.setseed {URL} - Sets the seed for the Race" +
                "\n.stream {Twitch username} - Changes the Twitch Username if it is different from the Discord Username";
        }

        embed.fields = [
            {'name': 'Commands', 'value': commands, 'inline': false},
            {'name': 'Player', 'value': names, 'inline': true},
            {'name': 'Status', 'value': status, 'inline': true},
            {'name': 'Time', 'value': times, 'inline': true},
        ];
    }

    message = {
        'content': "",
        'embed': embed
    }

    const raceMessage = channel.fetchMessage(race.messageId).then(x =>
        x.edit(message).then().catch(console.error)).catch(console.error);
    return;
};