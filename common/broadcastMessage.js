const broadcastTwitch = require('../common/broadcastTwitch');

module.exports = (config, dChannel, tClient, message, bold) => {
    dChannel.send(bold ? `**${message}**` : message).then().catch(console.error);

    broadcastTwitch(config, tClient, message);
};