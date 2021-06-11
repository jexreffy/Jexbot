'use strict'
module.exports = (app, context, message, bold) => {
    if (context.raceChannel) {
        context.raceChannel.send(bold ? `**${message}**` : message).then().catch(console.error);
    }

    app.routines["broadcastTwitch"](app, context, message);
};