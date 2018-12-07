const Base = require('../../base');
const assert = require('assert');

module.exports = class WhereContain extends Base {
    constructor(field, value) {
        super();
        this._field = field;
        this._value = value;
        assert(['string', 'number', 'boolean'].includes(typeof value), 'bad where contain');
    }

    get field() {
        return this._field;
    }

    get value() {
        return this._value;
    }
}
