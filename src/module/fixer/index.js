let BooleanFixer = undefined;
let IntegerFixer = undefined;
let NullFixer = undefined;
let NumberFixer = undefined;
let StringFixer = undefined;
let ArrayFixer = undefined;
let ObjectFixer = undefined;

module.exports = class Fixer {
    constructor(schema) {
        this._schema = schema;
        if (BooleanFixer === undefined) BooleanFixer = require('./boolean');
        if (IntegerFixer === undefined) IntegerFixer = require('./integer');
        if (NullFixer === undefined) NullFixer = require('./null');
        if (NumberFixer === undefined) NumberFixer = require('./number');
        if (StringFixer === undefined) StringFixer = require('./string');
        if (ArrayFixer === undefined) ArrayFixer = require('./array');
        if (ObjectFixer === undefined) ObjectFixer = require('./object');
    }
    
    static from(schema) {
        return new Fixer(schema);
    }

    static hasDefaultKeyword(schema) {
        switch (schema.type) {
            case 'boolean':
                return schema.default !== undefined;
            case 'array':
                return this.hasDefaultKeyword(schema.items);
            case 'integer':
                return schema.default !== undefined;
            case 'number':
                return schema.default !== undefined;
            case 'string':
                return schema.default !== undefined;
            case 'null':
                return schema.default !== undefined;
            case 'object':
                if (schema.patternProperties !== undefined) {
                    return Object.values(schema.patternProperties).some(_ => this.hasDefaultKeyword(_));
                }
                else if (schema.properties !== undefined) {
                    return Object.values(schema.properties).some(_ => this.hasDefaultKeyword(_));
                }
                else {
                    return false;
                }
            default:
                throw new Error(`no support type ${schema.type}`);
        }
    }

    fix(instance, strict) {
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
        return fixResult;
    }
}