const BooleanFixer = require('./boolean');
const IntegerFixer = require('./integer');
const NullFixer = require('./null');
const NumberFixer = require('./number');
const StringFixer = require('./string');
const ArrayFixer = require('./array');
const ObjectFixer = require('./object');

module.exports = class Fixer {
    constructor(schema) {
        this._schema = schema;
    }
    
    static from(schema) {
        return new Fixer(schema);
    }

    fix(instance, strict) {
        instance = JSON.parse(JSON.stringify(instance));
        let fixResult = undefined;
        switch (this._schema.type) {
            case 'boolean':
                fixResult = BooleanFixer(this._schema, instance);
                break;
            case 'array':
                fixResult = ArrayFixer(this._schema, instance);
                break;
            case 'integer':
                fixResult = IntegerFixer(this._schema, instance);
                break;
            case 'number':
                fixResult = NumberFixer(this._schema, instance);
                break;
            case 'string':
                fixResult = StringFixer(this._schema, instance);
                break;
            case 'null':
                fixResult = NullFixer(this._schema, instance);
                break;
            case 'object':
                fixResult = ObjectFixer(this._schema, instance, strict);
                break;
            default:
                throw new Error(`no support type ${this._schema.type}`);
        }
        return fixResult == undefined ? instance : fixResult;
    }
}