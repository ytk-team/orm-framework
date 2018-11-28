const BooleanValidator = require('./boolean');
const IntegerValidator = require('./integer');
const NullValidator = require('./null');
const NumberValidator = require('./number');
const StringValidator = require('./string');
const ArrayValidator = require('./array');
const ObjectValidator = require('./object');

module.exports = class Validator {
    constructor(schema) {
        this._schema = schema;
        this._errorText = undefined;
    }
    
    static from(schema) {
        return new Validator(schema);
    }

    validate(instance) {
        try {
            switch (this._schema.type) {
                case 'boolean':
                    BooleanValidator(this._schema, instance, '.');
                    break;
                case 'array':
                    ArrayValidator(this._schema, instance, '');
                    break;
                case 'integer':
                    IntegerValidator(this._schema, instance, '.');
                    break;
                case 'number':
                    NumberValidator(this._schema, instance, '.');
                    break;
                case 'string':
                    StringValidator(this._schema, instance, '.');
                    break;
                case 'null':
                    NullValidator(this._schema, instance, '.');
                    break;
                case 'object':
                    ObjectValidator(this._schema, instance, '.');
                    break;
                default:
                    throw new Error(`no support type ${this._schema.type}`);
            }
            return true;
        }
        catch(error) {
            this._errorText = error.message;
            return false;
        }
    }
    
    get jsonSchema() {
        return this._schema;
    }

    get errorText() {
        return this._errorText;
    }
}
