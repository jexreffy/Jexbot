'use strict'
const express = require('express');

module.exports = class JexBotHTTP {
    #app;
    #http;

    constructor(app) {
        let http = express();

        this.#app = app;
        this.#http = http;

        http.get('/', (req, res) => {
            res.send('Hello World!');
        });

        http.listen(process.env.HTTP_PORT, () => {
            console.log(`HTTP Server Listening at ${process.env.HTTP_PORT}`)
        });
    }
}