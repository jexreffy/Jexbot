module.exports = (event) => {
    let time = new Date();
    console.log(time.toLocaleString('en-US') + ' disconnected \n' + event.reason);
};