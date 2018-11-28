const Base = require('../base');

module.exports = class Sort extends Base {
    constructor(field, order) {
        super();
        this._field = field;
        this._order = order.toUpperCase();
    }

    get field() {
        return this._field;
    }

    get order() {
        return this._order;
    }
    
    toMysqlParams(tableName) {
        let columnName = this.getColumnName(tableName, this._field);
        return `${columnName} ${this._order}`;
    }
}
