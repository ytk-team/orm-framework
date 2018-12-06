const Base = require('../base');

module.exports = class Limit extends Base {
    constructor(limit, skip) {
        super();
        this._limit = limit;
        this._skip = skip;
    }

    get limit() {
        return this._limit;
    }

    get skip() {
        return this._skip;
    }
}