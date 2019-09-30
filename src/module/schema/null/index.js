const {schema: Schema} = require('@qtk/schema');
module.exports = () => {
    let schema = Schema.empty();
    schema.default = (value) => {
        schema.normalize().custom('default', value);
        return schema;
    }
    
    return schema;
}