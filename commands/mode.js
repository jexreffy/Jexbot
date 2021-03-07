module.exports = (config, race, tClient, tChannel) => {
    if (tClient) tClient.say(tChannel, config.categories[race.category].description).then().catch(console.error);
};