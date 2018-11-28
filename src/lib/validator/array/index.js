const assert = require('assert');
const hash = require('json-hash');

const ArrayValidator = (schema, value, path) => {
    assert(value instanceof Array, ` ${path} is not array, now : ${value}`);
    
    if (schema.maxItems != undefined) {
        assert(schema.maxItems >= value.length, ` ${path} length can't be logger than ${schema.maxItems}, now : ${value.length}`);
    }
    if (schema.minItems != undefined) {
        assert(schema.minItems <= value.length, ` ${path} length can't be shorter than ${schema.minItems}, now : ${value.length}`);
    }
    if (schema.length != undefined) {
        assert(schema.length == value.length, ` ${path} length must ${schema.length}, now : ${value.length}`);
    }

    if (schema.contains != undefined) {
        let has = false;
        for (let item of value) {
            try {
                validate(schema.contains, item, path, this);
                has = true;
                break;
            }
            catch(error) {}
        }
        assert(has, ` ${path} must contains ${JSON.stringify(schema.contains)}`);
    }

    if (schema.uniqueItems != undefined) {
        let hashList = value.map(_ => hash.digest(_));
        assert(hashList.length == (new Set(hashList)).size, ` ${path} must be a unique array`);
    }
    
    if (schema.items == undefined) return;
    if (schema.items instanceof Array) {
        //最少原则
        let checkItemAmount = Math.min(schema.items.length, value.length);
        value.slice(0, checkItemAmount).forEach((item, index) => {
            validate(schema.items[index], item, `${path}[${index}]`, this); 
        })
    }
    else {
        value.forEach((item, index) => {
            validate(schema.items, item, `${path}[${index}]`, this);
        })
    }

}

function validate(schema, value, path) {
    const BooleanValidator = require('../boolean');
    const IntegerValidator = require('../integer');
    const NullValidator = require('../null');
    const NumberValidator = require('../number');
    const StringValidator = require('../string');
    const ObjectValidator = require('../object');

    switch (schema.type) {
        case 'boolean':
            BooleanValidator(schema, value, path);
            break;
        case 'array':
            ArrayValidator(schema, value, path);
            break;
        case 'integer':
            IntegerValidator(schema, value, path);
            break;
        case 'number':
            NumberValidator(schema, value, path);
            break;
        case 'string':
            StringValidator(schema, value, path);
            break;
        case 'null':
            NullValidator(schema, value, path);
            break;
        case 'object':
            ObjectValidator(schema, value, path);
            break;
        default:
            throw new Error(`no support type ${schema.type}`);
    }
}

module.exports = ArrayValidator;