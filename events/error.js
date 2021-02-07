module.exports = (error) => {
    let time = new Date();
    console.log(time.toLocaleString('en-US') + ' error \n' + error.message);
};