'use strict'
module.exports = (str, length, char = ' ') => {
    str.padStart((str.length + length) / 2, char).padEnd(length, char);
}