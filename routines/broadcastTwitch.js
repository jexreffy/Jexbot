'use strict'
module.exports = (app, context, message, delay = false) => {
    if (!app.isConnectedToTwitch(context.guildId)) return;

    let restreamChannel = app.config.guilds[context.guildId]['restreamChannel'];

    let channels = app.getTwitchChannels(context.guildId);

    for (let i = 0; i < channels.length; i++) {
        if (delay && channels[i] === restreamChannel) {
            const sleep = app.sleep;

            (async() => {
                await sleep(30000);
                app.sendToTwitchChannel(context.guildId, `${restreamChannel}`, message).then().catch(console.error);
            })();
        } else {
            app.sendToTwitchChannel(context.guildId, `${channels[i]}`, message).then().catch(console.error);
        }
    }
};