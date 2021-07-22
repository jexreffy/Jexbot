'use strict'
require('dotenv').config();

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const App = require('./services/app');
let app = new App();