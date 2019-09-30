const assert = require('assert');
const {schema: Schema} = require('@qtk/schema');

module.exports = () => {
    let schema = Schema.string();

    schema.default = (value) => {
        schema.normalize().custom('default', value);
        return schema;
    }

    schema.index = () => {
        schema.normalize().custom('index', true);
        return schema;
    }

    schema.normalize().custom('getIndexInfo', (needCheckLength) => {
        let maxLength = schema._semanticSchema._current.content.maxLength;
        if (needCheckLength === true) {
            assert(maxLength != undefined, `key to index must set maxLength`);
            assert(maxLength <= Math.floor(767 / 4), `key length is no longer than ${Math.floor(767 / 4)}`); //InnoDB存储引擎的表索引的前缀长度最长是767字节,编码采用utf8mb4
        }
        return {type: 'string', length: maxLength || -1};
    });

    return schema;
};