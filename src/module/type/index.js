const ObjectSchema  = require('../schema/object');
const ArraySchema   = require('../schema/array');
const StringSchema  = require('../schema/string');
const NumberSchema  = require('../schema/number');
const IntegerSchema = require('../schema/integer');
const BooleanSchema = require('../schema/boolean');
const NullSchema    = require('../schema/null');

module.exports = {
    object: (properties) => {
        let schema = ObjectSchema();
        if (properties) schema.properties(properties);
        return schema;
    }, 
    array: (item) => {
        let schema = ArraySchema();
        if (item) schema.item(item);
        return schema;
    }, 
    string: (pattern) => {
        let schema = StringSchema();
        if (pattern) schema.pattern(pattern);
        return schema;
    }, 
    integer: (min, max) => {
        let schema = IntegerSchema();
        if(min) schema.min(min);
        if(max) schema.max(max);
        return schema;
    }, 
    number: (min, max) => {
        let schema = NumberSchema();
        if(min) schema.min(min);
        if(max) schema.max(max);
        return schema;
    }, 
    boolean: () => BooleanSchema(), 
    NULL: () => NullSchema(),
    empty: () => NullSchema(),
    invalid: () => NullSchema().invalid()
};