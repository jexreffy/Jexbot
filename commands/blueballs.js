module.exports = (race, message) => {
    if (!race.blueballs >= 0) return;

    let match = message.match(/^[.!](\bblueballs\b) ([0-9]{1,2})/i);
    let blueballs = parseInt(match[2]);

    if (blueballs <= 0 || blueballs > 15) return;

    race.blueballs = blueballs;
}