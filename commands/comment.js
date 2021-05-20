
module.exports = (config, race, dChannel, username, message) => {
    let player = race.players.find(x => x.username === username);
    let match = message.content.match(/^[.!](\bcomment\b) ([ a-zA-Z0-9,./<>?;':"{}|`~!@#$%^&*()=_+]{0,1000})/i);

    if (match && match.length > 2 && race.started && player && (player.finished || player.forfeited)) {
        player.comment = match[2];

        dChannel.send(`**${username} commented ||${player.comment}||**`).then().catch(console.error);
    }
}