'use strict'
module.exports = (app, context, message) => {
    if (!context.twitchClient) return;

    for (let i = 0; i < context.twitchClient.channels.length; i++) {
        context.twitchClient.say(`${context.twitchClient.channels[i]}`, message).then().catch(console.error);
    }
};