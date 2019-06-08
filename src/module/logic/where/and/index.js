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

    toJson() {
        return {
            type: this.__proto__.constructor.name,
            fields: {
                _items: this._items.map(_ => _.toJson())
            }
        }
    }
}

