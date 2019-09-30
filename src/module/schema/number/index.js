const {schema: Schema} = require('@qtk/schema');
module.exports = () => {
    let schema = Schema.number();
    schema.default = (value) => {
        schema.normalize().custom('default', value);
        return schema;
    }
    schema.index = () => {
        schema.normalize().custom('index', true);
        return schema;
    }
    
    schema.normalize().custom('getIndexInfo', (needCheckLength) => ({type: 'number', length: 8}));

    return schema;
};
