let BooleanFixer = undefined;
let IntegerFixer = undefined;
let NullFixer = undefined;
let NumberFixer = undefined;
let StringFixer = undefined;
let ArrayFixer = undefined;
let ObjectValidator = undefined;
const Fixer = require('../');

const ObjectFixer = (schema, value, strict) => {
    if (value === undefined) {
        let hasDefaultKeyword = Fixer.hasDefaultKeyword(schema);
        if (schema.default !== undefined) {
            return schema.default; //即{}
        }

        if (hasDefaultKeyword) {
            value = {};
        }
        else {
            return undefined;
        }
    }

    let {properties, required} = getFinallySchema(schema, value);
    if (!strict) {
        value = Object.keys(value).reduce((prev, key) => {
            if (properties[key] === undefined) return prev;
            prev[key] = value[key];
            return prev;
        }, {})
    }
    let requiredProperties = required.reduce((prev, curr) => {
        prev[curr] = properties[curr];
        return prev;
    }, {});
    return propertiesFix(requiredProperties, value, strict);

}

function propertiesFix(requiredProperties, value, strict) {
    if (BooleanFixer === undefined) BooleanFixer = require('../boolean');
    if (IntegerFixer === undefined) IntegerFixer = require('../integer');
    if (NullFixer === undefined) NullFixer = require('../null');
    if (NumberFixer === undefined) NumberFixer = require('../number');
    if (StringFixer === undefined) StringFixer = require('../string');
    if (ArrayFixer === undefined) ArrayFixer = require('../array');

    let keys = new Set(Object.keys(value));
    for (let standardKey in requiredProperties) {
        if (
            !keys.has(standardKey) || 
            requiredProperties[standardKey].type === "object" || 
            requiredProperties[standardKey].type === "array"
        ) {
            let fixResult = undefined;
            switch (requiredProperties[standardKey].type) {
                case 'boolean':
                    fixResult = BooleanFixer(requiredProperties[standardKey], value[standardKey]);
                    break;
                case 'array':
                    fixResult = ArrayFixer(requiredProperties[standardKey], value[standardKey], strict);
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
                    fixResult = ObjectFixer(requiredProperties[standardKey], value[standardKey], strict);
                    break;
                default:
                    throw new Error(`no support type ${requiredProperties[standardKey].type}`);
            }
            value[standardKey] = fixResult;
        }
    }
    return value;
}

function getFinallySchema(schema, value) {
    if (schema.if !== undefined) {
        let {required, properties, additionalProperties} = selectBranch(schema, value);
        return {
            required: required === undefined ? 
                (schema.required === undefined ? [] : schema.required) : required,
            properties: properties === undefined ? schema.properties : properties,
            additionalProperties: additionalProperties === undefined ? 
                (schema.additionalProperties === undefined ? false : schema.additionalProperties) : additionalProperties
        }
    }
    else {
        return {
            required: schema.requiredAll === true ? Object.keys(schema.properties) : (schema.required === undefined ? [] : schema.required),
            properties: schema.properties,
            additionalProperties: schema.additionalProperties
        }
    }
}

function selectBranch(schema, value) {
    if (schema.if === undefined) {
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
        if (schema.then === undefined) throw new Error(`if must had then`);
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