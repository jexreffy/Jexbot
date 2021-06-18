'use strict'
module.exports = (app, context, message, bold) => {
    app.sendToDiscordRaceChannel(bold ? `**${message}**` : message).then().catch(console.error);
    app.routines["broadcastTwitch"](app, context, message);
};