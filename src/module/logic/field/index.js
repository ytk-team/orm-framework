const Base = require('../base');

module.exports = class Field extends Base {
    constructor(field, alias) {
        super();
        this._field = field;
        this._alias = alias;
    }

    get field() {
        return this._field;
    }

    get alias() {
        return this._alias;
    }
}
