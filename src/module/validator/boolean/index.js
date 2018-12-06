const assert = require('assert');

module.exports = (schema, value, path) => {
    assert(typeof value === 'boolean', ` ${path} is not boolean, now : ${value}`);
    if (schema.enum != undefined) {
        assert(schema.enum.includes(value), ` ${path} is not in enum, now : ${value}`);
    }
}