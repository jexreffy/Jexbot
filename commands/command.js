'use strict'

module.exports = class JexCommand {
    _app;

    constructor(app) {
        this._app = app;
    }

    get commandName() {
        return '';
    }

    get isRaceCommand() {
        return false;
    }

    isCommandValid(context) {
        return false;
    }

    executeCommand(context) {

    }
}