const assert = require('assert');

module.exports = (schema, value, path) => {
    assert(value === null, ` ${path} is not null, now : ${value}`);
}