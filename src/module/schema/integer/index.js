const NumberSchema = require('../number');

module.exports = class IntegerSchema extends NumberSchema {
    constructor() {
        super();
        this._current.set('type', 'integer');
        this._current.set('getIndexInfo', (needCheckLength) => ({type: 'integer', length: (Number.MIN_SAFE_INTEGER).toString().length}));
    }

    index() {
        this._current.set('index', true);
        return this;
    }
};
