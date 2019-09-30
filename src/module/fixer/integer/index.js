module.exports = (schema, value) => {
    return (schema.default !== undefined && value === undefined) ? schema.default : value;
}