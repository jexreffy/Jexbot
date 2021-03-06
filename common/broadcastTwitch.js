module.exports = (config, tClient, message) => {
    if (!tClient) return;

    for (let i = 0; i < tClient.channels.length; i++) {
        tClient.say(`${tClient.channels[i]}`, message).then().catch(console.error);
    }
};