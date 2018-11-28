const Base = require('../../base');
const assert = require('assert');

module.exports = class WhereIn extends Base {
    constructor(field, items) {
        super();
        this._field = field;
        this._items = items;
        for(let item of items) {
            assert(!(item instanceof Base), 'bad where IN');
        }
    }

    get field() {
        return this._field;
    }

    get items() {
        return this._items;
    }
}
