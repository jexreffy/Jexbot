'use strict'
module.exports = (app, context, message, bold, delay) => {
    app.sendToDiscordRaceChannel(context.guildId, bold ? `**${message}**` : message).then().catch(console.error);
    app.routines["broadcastTwitch"](app, context, message, delay);
};