const ArrayFixer = (schema, value) => {
    if (schema.default != undefined && value == undefined) return schema.default;
}

module.exports =  ArrayFixer;