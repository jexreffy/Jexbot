module.exports = (config, tClient, message) => {
    for (let i = 0; i < config.twitchChannels.length; i++) {
        tClient.say(`${config.twitchChannels[i]}`, message).then().catch(console.error);;
    }
};