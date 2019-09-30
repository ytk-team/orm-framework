const {schema: Schema} = require('@qtk/schema');
module.exports = () => {
    let schema = Schema.integer();
    schema.default = (value) => {
        schema.normalize().custom('default', value);
        return schema;
    }
    schema.index = () => {
        schema.normalize().custom('index', true);
        return schema;
    }
    
    schema.normalize().custom('getIndexInfo', (needCheckLength) => ({type: 'integer', length: (Number.MIN_SAFE_INTEGER).toString().length}));

    return schema;
}
