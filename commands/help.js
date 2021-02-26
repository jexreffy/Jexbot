module.exports = (config, tClient, tChannel) => {
    if (tClient) tClient.say(tChannel, config.help).then().catch(console.error);
};