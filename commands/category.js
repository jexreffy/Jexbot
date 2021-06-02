module.exports = (config, race, tClient, tChannel) => {
    if (tClient) tClient.say(tChannel, `${race.categoryName} ${race.categoryDescription}`).then().catch(console.error);
};