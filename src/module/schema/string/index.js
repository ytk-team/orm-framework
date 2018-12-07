const Base = require('../base');
const assert = require('assert');
module.exports = class extends Base {
    constructor() {
        super();
        this._current.set('type', 'string');
        this._current.set('getIndexInfo', (needCheckLength) => {
            let maxLength = this._current.get('maxLength');
            if (needCheckLength == true) {
                assert(maxLength != undefined, `key to index must set maxLength`);
                assert(maxLength <= Math.floor(767 / 4), `key length is no longer than ${Math.floor(767 / 4)}`); //InnoDB存储引擎的表索引的前缀长度最长是767字节,编码采用utf8mb4
            }
            return {type: 'string', length: maxLength || -1};
        });
    }
    
    enum(...enumArr) {
        this._current.set('enum', enumArr);
        return this;
    }

    maxLength(len) {
        this._current.set('maxLength', len);
        return this;
    }

    minLength(len) {
        this._current.set('minLength', len);
        return this;
    }

    length(len) {
        this.minLength(len).maxLength(len);
        return this;
    }

    pattern(regex) {
        if (regex instanceof RegExp) this._current.set('pattern', regex.source);
        else this._current.set('pattern', regex);
        return this;
    }

    default(value) {
        this._current.set('default', value);
        return this;
    }

    index() {
        this._current.set('index', true);
        return this;
    }
    
};
