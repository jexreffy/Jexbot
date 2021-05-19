module.exports = (config, race, tClient, tChannel) => {
    if (tClient) tClient.say(tChannel, race.ladder ? config.helpLadder : race.invitational ? config.helpInvitational : config.helpRace).then().catch(console.error);
};