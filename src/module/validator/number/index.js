const assert = require('assert');

module.exports = (schema, value, path) => {
    assert(typeof value === 'number', ` ${path} is not number, now : ${value}`);
    if (schema.enum != undefined) {
        assert(schema.enum.includes(value), ` ${path} is not in enum, now : ${value}`);
    }
    if (schema.maximum != undefined) {
        assert(schema.maximum >= value, ` ${path} can't be bigger than ${schema.maximum}, now : ${value}`);
    }
    if (schema.minimum != undefined) {
        assert(schema.minimum <= value, ` ${path} can't be less than ${schema.minimum}, now : ${value}`);
    }
    if (schema.exclusiveMaximum != undefined) {
        assert(schema.exclusiveMaximum > value, ` ${path} must less than ${schema.exclusiveMaximum}, now : ${value}`);
    }
    if (schema.exclusiveMinimum != undefined) {
        assert(schema.exclusiveMinimum < value, ` ${path} must bigger than ${schema.exclusiveMinimum}, now : ${value}`);
    }
    if (schema.multipleOf != undefined) {
        let max = Math.max(Math.abs(schema.multipleOf), Math.abs(value));
        let min = Math.min(Math.abs(schema.multipleOf), Math.abs(value));
        assert(value === 0 || max % min === 0, ` ${path} must multiple of ${schema.multipleOf}, now : ${value}`);
    }
}