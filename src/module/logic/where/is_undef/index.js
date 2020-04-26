const Base = require('../../base');

module.exports = class WhereIsDef extends Base {
    constructor(field) {
        super();
        this._field = field;
    }

    get field() {
        return this._field;
    }
};
