const Base = require('../../base');
const assert = require('assert');

module.exports = class WhereBetween extends Base {
    constructor(field, from, to) {
        super();
        this._field = field;
        this._from = from;
        this._to = to;
        assert(!(from instanceof Base), 'bad where BETWEEN');
        assert(!(to instanceof Base), 'bad where BETWEEN');
    }

    get field() {
        return this._field;
    }

    get from() {
        return this._from;
    }

    get to() {
        return this._to;
    }
}