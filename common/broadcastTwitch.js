'use strict'
module.exports = (app, context, message) => {
    if (!app.isConnectedToTwitch(context.guildId)) return;

    let channels = app.getTwitchChannels(context.guildId);

    for (let i = 0; i < channels.length; i++) {
        app.sendToTwitchChannel(context.guildId, `${channels[i]}`, message).then().catch(console.error);
    }
};