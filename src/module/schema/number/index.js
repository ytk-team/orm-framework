const BaseSchema = require('../base');

module.exports = class NumberSchema extends BaseSchema {
    constructor() {
        super();
        this._current.set('type', 'number');
        this._current.set('getIndexInfo', () => ({type: 'number', length: 8}));
    }

    enum(...enumArr) {
        this._current.set('enum', enumArr);
        return this;
    }

    max(num) {
        this._current.set('maximum', num);
        return this;
    }

    min(num) {
        this._current.set('minimum', num);
        return this;
    }

    exclusiveMax(num) {
        this._current.set('exclusiveMaximum', num);
        return this;
    }

    exclusiveMin(num) {
        this._current.set('exclusiveMinimum', num);
        return this;
    }

    multipleOf(num) {
        this._current.set('multipleOf', num);
        return this;
    }

    default(value) {
        this._current.set('default', value);
        return this;
    }

    index() {
        this._current.set('index', true);
        return this;
    }
};
