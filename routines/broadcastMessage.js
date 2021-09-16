'use strict'
module.exports = (app, context, message, bold, delay = false) => {
    app.sendToDiscordRaceChannel(context.guildId, bold ? `**${message}**` : message).then().catch(console.error);
    app.routines["broadcastTwitch"](app, context, message, delay);
};