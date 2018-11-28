const Base = require('../../base');
const assert = require('assert');

module.exports = class WhereAnd extends Base {
    constructor(items) {
        super();
        assert(items instanceof Array, 'bad where AND');
        for(let item of items) {
            assert(item instanceof Base, 'bad where AND');
        }
        this._items = items;
    }

    get items() {
        return this._items;
    }
}

