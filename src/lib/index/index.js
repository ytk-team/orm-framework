module.exports = {
    analysis: (inputSchema, additionIndexPaths = []) => {
        const scan = (schema, path = "") => {
            switch(schema.type) {
                case "string":
                case "integer":
                case "number":
                    if (schema.index == true || additionIndexPaths.includes(path)) {
                        return [Object.assign({path: `${path}`}, schema.getIndexInfo())]
                    }
                    else {
                        return [];
                    }
                case "object":
                    if (schema.properties == undefined) return [];//只支持确定的key
                    return Object.keys(schema.properties).reduce((prev, key) => prev.concat(scan(schema.properties[key], `${path}.${key}`)), [])
                default:
                    return [];
            }
        }
        return scan(inputSchema);
    }
}