const {schema: Schema} = require('@qtk/schema');
module.exports = () => {
    let schema = Schema.object();

    schema.defaultEmpty = () => {
        schema.normalize().custom('default', {});
        return schema;
    }

    return schema;
}
