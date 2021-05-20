const getRandom = require('../common/getRandom');

module.exports = (config, dChannel, username) => {
    dChannel.send(config.friday[getRandom(config.friday.length)].replace('NAME', username)).then().catch(console.error);
};