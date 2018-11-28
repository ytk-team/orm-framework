const Base = require('../../base');
const assert = require('assert');

module.exports = class WhereLike extends Base {
    constructor(field, value) {
        super();
        this._field = field;
        this._value = value;
        assert(!(value instanceof Base), 'bad where LIKE');
    }

    get field() {
        return this._field;
    }

    get value() {
        return this._value;
    }
}
