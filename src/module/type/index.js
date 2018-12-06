const BaseSchema  = require('../schema/base');
const ObjectSchema  = require('../schema/object');
const ArraySchema   = require('../schema/array');
const StringSchema  = require('../schema/string');
const NumberSchema  = require('../schema/number');
const IntegerSchema = require('../schema/integer');
const BooleanSchema = require('../schema/boolean');
const NullSchema    = require('../schema/null');

module.exports = {
    object: (properties) => {
        let schema = new ObjectSchema();
        if (properties) schema.properties(properties);
        return schema;
    }, 
    array: (item) => {
        let schema = new ArraySchema();
        if (item) schema.item(item);
        return schema;
    }, 
    string: (pattern) => {
        let schema = new StringSchema();
        if (pattern) schema.pattern(pattern);
        return schema;
    }, 
    integer: (min, max) => {
        let schema = new IntegerSchema();
        if(min) schema.min(min);
        if(max) schema.max(max);
        return schema;
    }, 
    number: (min, max) => {
        let schema = new NumberSchema();
        if(min) schema.min(min);
        if(max) schema.max(max);
        return schema;
    }, 
    boolean: () => new BooleanSchema(), 
    NULL: () => new NullSchema(),
    empty: () => new NullSchema(),
    invalid: () => new BaseSchema().invalid()
};