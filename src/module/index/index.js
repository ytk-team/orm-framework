module.exports = {
    analysis: (inputSchema, additionIndexPaths = []) => {
        const scan = (schema, path = "", needCheckLength　= true) => { //数组的索引是全文索引，不需限定长度
            switch(schema.type) {
                case "string":
                case "integer":
                case "number":
                    if (schema.index == true || additionIndexPaths.includes(path)) {
                        return [Object.assign({path: `${path}`, indexType: 'NORMAL'}, schema.getIndexInfo(needCheckLength))]
                    }
                    else {
                        return [];
                    }
                case "object":
                    if (schema.properties == undefined) return [];//只支持确定的key
                    return Object.keys(schema.properties).reduce((prev, key) => prev.concat(scan(schema.properties[key], `${path}.${key}`, needCheckLength)), [])
                case "array":
                    switch(schema.items.type) {
                        case "string":
                        case "integer":
                        case "number":
                        case "object":
                            return scan(schema.items, `${path}[*]`, false)
                                .map(_ => {
                                    _.indexType = 'FULL_TEXT'; //数组采用全文索引
                                    return _;
                                });
                        default:
                            return [];
                    }
                default:
                    return [];
            }
        }
        return scan(inputSchema);
    }
}