module.exports = (warning) => {
    let time = new Date();
    console.log(time.toLocaleString('en-US') + ' warning: \n' + warning);
};