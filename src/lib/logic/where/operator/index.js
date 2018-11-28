const Base = require('../../base');
const assert = require('assert');

module.exports = class WhereOperator extends Base {
    constructor(field, op, value) {
        super();
        this._field = field;
        this._op = op;
        this._value = value;
        assert(['string', 'number', 'boolean'].includes(typeof value), 'bad where OPERATOR');
    }

    get field() {
        return this._field;
    }

    get op() {
        return this._op;
    }

    get value() {
        return this._value;
    }
}
