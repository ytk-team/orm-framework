const assert = require('assert');

module.exports = (schema, value, path) => {
    assert(typeof value === 'string', ` ${path} is not string, now : ${value}`);
    if (schema.enum != undefined) {
        assert(schema.enum.includes(value), ` ${path} is not in enum, now : ${value}`);
    }
    if (schema.maxLength != undefined) {
        assert(schema.maxLength >= value.length, ` ${path} length can't be logger than ${schema.maxLength}, now : ${value.length}`);
    }
    if (schema.minLength != undefined) {
        assert(schema.minLength <= value.length, ` ${path} length can't be shorter than ${schema.minLength}, now : ${value.length}`);
    }
    if (schema.length != undefined) {
        assert(schema.length == value.length, ` ${path} length must ${schema.length}, now : ${value.length}`);
    }
    if (schema.pattern != undefined) {
        assert(RegExp(schema.pattern).test(value), ` ${path} must match regexp ${String(schema.pattern)}, now : ${value}`);
    }
}