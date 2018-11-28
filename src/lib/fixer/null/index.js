module.exports = (schema, value) => {
    if (schema.default != undefined && value == undefined) return schema.default;
}