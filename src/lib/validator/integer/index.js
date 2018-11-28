const assert = require('assert');
const NumberValidator = require(`../number`);

module.exports = (schema, value, path) => {
    NumberValidator(schema, value, path);
    assert(Number.isInteger(value), ` ${path} is not integer, now : ${value}`);
}