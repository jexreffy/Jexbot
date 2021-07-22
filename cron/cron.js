'use strict'

module.exports = class JexCron {
    _app;

    constructor(app) {
        this._app = app;
    }

    get cronName() {
        return '';
    }

    get isGuildBased() {
        return false;
    }

    shouldTick(context) {
        return false;
    }

    tick(context) {

    }
}