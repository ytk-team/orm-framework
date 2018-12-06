const BooleanFixer = require('../boolean');
const IntegerFixer = require('../integer');
const NullFixer = require('../null');
const NumberFixer = require('../number');
const StringFixer = require('../string');
const ArrayFixer = require('../array');
const ObjectValidator = require('../../validator/object');

const ObjectFixer = (schema, value, removeSchemaUndefinedProperties) => {
    if (value == undefined) {
        return schema.default;
    }
    else {
        let {properties, required} = getFinallySchema(schema, value);
        if (removeSchemaUndefinedProperties) {
            value = Object.keys(value).reduce((prev, key) => {
                if (properties[key] == undefined) return prev;
                prev[key] = value[key];
                return prev;
            }, {})
        }
        let requiredProperties = required.reduce((prev, curr) => {
            prev[curr] = properties[curr];
            return prev;
        }, {});
        return propertiesFix(requiredProperties, value, removeSchemaUndefinedProperties);
    }
}

function propertiesFix(requiredProperties, value, removeSchemaUndefinedProperties) {
    let keys = Object.keys(value);
    for (let standardKey in requiredProperties) {
        if (!keys.includes(standardKey) || requiredProperties[standardKey].type == "object") {
            let fixResult = undefined;
            switch (requiredProperties[standardKey].type) {
                case 'boolean':
                    fixResult = BooleanFixer(requiredProperties[standardKey], value[standardKey]);
                    break;
                case 'array':
                    fixResult = ArrayFixer(requiredProperties[standardKey], value[standardKey]);
                    break;
                case 'integer':
                    fixResult = IntegerFixer(requiredProperties[standardKey], value[standardKey]);
                    break;
                case 'number':
                    fixResult = NumberFixer(requiredProperties[standardKey], value[standardKey]);
                    break;
                case 'string':
                    fixResult = StringFixer(requiredProperties[standardKey], value[standardKey]);
                    break;
                case 'null':
                    fixResult = NullFixer(requiredProperties[standardKey], value[standardKey]);
                    break;
                case 'object':
                    fixResult = ObjectFixer(requiredProperties[standardKey], value[standardKey],
 removeSchemaUndefinedProperties);
                    break;
                default:
                    throw new Error(`no support type ${requiredProperties[standardKey].type}`);
            }
            if (fixResult != undefined) value[standardKey] = fixResult;
        }
    }
    return value;
}

function getFinallySchema(schema, value) {
    if (schema.if != undefined) {
        let {required, properties, additionalProperties} = selectBranch(schema, value);
        return {
            required: required == undefined ? 
                (schema.required == undefined ? [] : schema.required) : required,
            properties: properties == undefined ? schema.properties : properties,
            additionalProperties: additionalProperties == undefined ? 
                (schema.additionalProperties == undefined ? false : schema.additionalProperties) : additionalProperties
        }
    }
    else {
        return {
            required: schema.requiredAll == true ? Object.keys(schema.properties) : (schema.required == undefined ? [] : schema.required),
            properties: schema.properties,
            additionalProperties: schema.additionalProperties
        }
    }
}

function selectBranch(schema, value) {
    if (schema.if == undefined) {
        return {
            required: schema.required,
            properties: schema.properties,
            additionalProperties: schema.additionalProperties
        }
    }
    try {
        ObjectValidator(
            Object.assign({}, schema.if, {additionalProperties: true}), 
            value
        );
        if (schema.then == undefined) throw new Error(`if must had then`);
        return {
            required: schema.then.required,
            properties: schema.then.properties,
            additionalProperties: schema.then.additionalProperties
        }
    }
    catch(error) {
        return selectBranch(schema.else, value);
    }
}

module.exports = ObjectFixer;