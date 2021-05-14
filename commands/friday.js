module.exports = (config, dChannel, username) => {
    dChannel.send(config.friday[Math.floor(Math.random() * Math.floor(config.friday.length))].replace('NAME', username)).then().catch(console.error);
};