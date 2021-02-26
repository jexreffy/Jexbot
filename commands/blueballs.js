module.exports = (race, tClient, tChannel, message) => {
    if (race.blueballs >= 0) return;

    let match = message.match(/^[.!](\bblueballs\b) ([0-9]{1,2})/i);
    let blueballs = parseInt(match[2]);

    if (blueballs <= 0 || blueballs > 15) return;

    race.blueballs = blueballs;

    tClient.say(tChannel, `Aga 1 Blue Balls recorded as ${blueballs}`).then().catch(console.error);
}