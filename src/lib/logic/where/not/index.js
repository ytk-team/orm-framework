const Base = require('../../base');
const assert = require('assert');

module.exports = class WhereNot extends Base {
    constructor(item) {
        super();
        assert(item instanceof Base, 'bad where NOT');
        this._item = item;
    }

    get item() {
        return this._item;
    }
}