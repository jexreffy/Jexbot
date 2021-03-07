const broadcastTwitch = require('../common/broadcastTwitch');

module.exports = (config, dChannel, tClient, message, bold) => {
    if (dChannel) dChannel.send(bold ? `**${message}**` : message).then().catch(console.error);

    broadcastTwitch(config, tClient, message);
};