const {schema: Schema} = require('@qtk/schema');
module.exports = () => {
    let schema = Schema.array();
    schema.defaultAmount = (value) => {
        schema.normalize().custom('defaultAmount', value);
        return schema;
    }
    return schema;
}