const assert = require('assert');

const ObjectValidator = (schema, value, path) => {
    assert(require('isobject')(value) && !(value instanceof RegExp), ` ${path} is not object, now : ${value}`);
    let {properties, patternProperties, required, additionalProperties} = getFinallySchema(schema, value, `.${path}`);
    
    let hit = [];
    if (properties != undefined) {
        hit = propertiesCheck(properties, value, path);
    }
    else if (patternProperties != undefined) {
        hit = patternPropertiesCheck(patternProperties, value, path);
    }

    required.forEach(_ => assert(Object.keys(value).includes(_) != false, ` ${path} must has properties ${_}`));
    assert (additionalProperties == true || (additionalProperties == false && Object.keys(value).length == hit.length), ` ${path} can not has additional properties: ${Object.keys(value).filter(_ => !hit.includes(_)).join(', ')}`);
}

function patternPropertiesCheck(patternProperties, value, path) {
    const BooleanValidator = require('../boolean');
    const IntegerValidator = require('../integer');
    const NullValidator = require('../null');
    const NumberValidator = require('../number');
    const StringValidator = require('../string');
    const ArrayValidator = require('../array');

    let keys = Object.keys(value);
    let hit = [];
    for (let regexp in patternProperties) {
        let passKeys = [];
        for (let key of keys) {
            if (RegExp(regexp).test(key)) {
                switch (patternProperties[regexp].type) {
                    case 'boolean':
                        BooleanValidator(patternProperties[regexp], value[key], `${path}${key}.`);
                        break;
                    case 'array':
                        ArrayValidator(patternProperties[regexp], value[key], `${path}${key}.`);
                        break;
                    case 'integer':
                        IntegerValidator(patternProperties[regexp], value[key], `${path}${key}.`);
                        break;
                    case 'number':
                        NumberValidator(patternProperties[regexp], value[key], `${path}${key}.`);
                        break;
                    case 'string':
                        StringValidator(patternProperties[regexp], value[key], `${path}${key}.`);
                        break;
                    case 'null':
                        NullValidator(patternProperties[regexp], value[key], `${path}${key}.`);
                        break;
                    case 'object':
                        ObjectValidator(patternProperties[regexp], value[key], `${path}${key}.`);
                        break;
                    default:
                        throw new Error(`no support type ${patternProperties[regexp].type}`);
                }
                passKeys.push(key);
                hit.push(key);
            }
        }
        keys = keys.filter(_ => !passKeys.includes(_));
    }
    return hit;
}

function propertiesCheck(properties, value, path) {
    const BooleanValidator = require('../boolean');
    const IntegerValidator = require('../integer');
    const NullValidator = require('../null');
    const NumberValidator = require('../number');
    const StringValidator = require('../string');
    const ArrayValidator = require('../array');

    let keys = Object.keys(value);
    let hit = [];
    for (let standardKey in properties) {
        let passKeys = [];
        for (let key of keys) {
            if (standardKey == key) {
                switch (properties[standardKey].type) {
                    case 'boolean':
                        BooleanValidator(properties[standardKey], value[key], `${path}${key}.`);
                        break;
                    case 'array':
                        ArrayValidator(properties[standardKey], value[key], `${path}${key}.`);
                        break;
                    case 'integer':
                        IntegerValidator(properties[standardKey], value[key], `${path}${key}.`);
                        break;
                    case 'number':
                        NumberValidator(properties[standardKey], value[key], `${path}${key}.`);
                        break;
                    case 'string':
                        StringValidator(properties[standardKey], value[key], `${path}${key}.`);
                        break;
                    case 'null':
                        NullValidator(properties[standardKey], value[key], `${path}${key}.`);
                        break;
                    case 'object':
                        ObjectValidator(properties[standardKey], value[key], `${path}${key}.`);
                        break;
                    default:
                        throw new Error(`no support type ${properties[standardKey].type}`);
                }
                passKeys.push(key);
                hit.push(key);
            }
        }
        keys = keys.filter(_ => !passKeys.includes(_));
    }
    return hit;
}

function getFinallySchema(schema, value, path) {
    if (schema.if != undefined) {
        assert(schema.requiredAll != true, ` ${path} can not use if and requireAll at the same time`);
        let {required, properties, patternProperties, additionalProperties} = selectBranch(schema, value, path);
        return {
            required: required == undefined ? 
                (schema.required == undefined ? [] : schema.required) : required,
            properties: properties == undefined ? schema.properties : properties,
            patternProperties: patternProperties == undefined ? schema.patternProperties : patternProperties,
            additionalProperties: additionalProperties == undefined ? 
                (schema.additionalProperties == undefined ? false : schema.additionalProperties) : additionalProperties
        }
    }
    else {
        return {
            required: schema.required == undefined ? [] : schema.required,
            properties: schema.properties,
            patternProperties: schema.patternProperties,
            additionalProperties: schema.additionalProperties
        }
    }
}

function selectBranch(schema, value, path) {
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
            value,
            `${path}.if`
        );
        if (schema.then == undefined) throw new Error(`${path} if must had then`);
        return {
            required: schema.then.required,
            properties: schema.then.properties,
            patternProperties: schema.then.patternProperties,
            additionalProperties: schema.then.additionalProperties
        }
    }
    catch(error) {
        return selectBranch(schema.else, value, `${path}else`);
    }
}

module.exports = ObjectValidator;
