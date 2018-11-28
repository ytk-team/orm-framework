const Base = require('../../base');
const assert = require('assert');

module.exports = class WhereOr extends Base {
    constructor(items) {
        super();
        assert(items instanceof Array, 'bad where OR');
        for(let item of items) {
            assert(item instanceof Base, 'bad where OR');
        }
        this._items = items;
    }

    get items() {
        return this._items;
    }
}

