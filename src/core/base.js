const Type = require('../module/logic').Type;
const {sugar} = require('@qtk/schema');
const QTKValidator = require('@qtk/schema-validator');
const ValueFixer = require('../module/fixer');
const assert = require('assert');
module.exports = class {
    constructor(schema) {
        this._schema = sugar.resolve(schema).normalize().normalize();//to json schema
        this._needFix = ValueFixer.hasDefaultKeyword(this._schema);
        this._schemaCache = new Map();
        this._validatorCache = new Map();
        this._fixerCache = new Map();
    }

    _getNodeSchema(path) {
        let schema = this._schemaCache.get(path);
        if (schema !== undefined) return schema;

        if (path === ".") {
            schema = this._schema;
        }
        else {
            schema = path.split('.').slice(1).reduce((prev, curr) => {
                if (curr === '') return prev;
                if (curr.substr(-3) === '[*]') curr = curr.substr(0, curr.length - 3);
                if (prev.type === "object") {
                    return (prev.properties || prev.patternProperties)[curr];
                }
                else if (prev.type === "array") {
                    return prev.items;
                }
                else {
                    return prev;
                }
            }, this._schema);
        }
        this._schemaCache.set(path, schema);
        return schema;
    }

    _getNodeValidator(schemaPath) {
        let validator = this._validatorCache.get(schemaPath);
        if (validator !== undefined) return validator;

        let schema = this._getNodeSchema(schemaPath);

        validator = QTKValidator.fromJSONSchema(schema);
        this._validatorCache.set(schemaPath, validator);

        return validator;
    }

    _getNodeFixer(schemaPath) {
        let fixer = this._fixerCache.get(schemaPath);
        if (fixer !== undefined) return fixer;

        let schema = this._getNodeSchema(schemaPath);

        if (schemaPath !== ".") assert(schema.type === 'array', `path ${schemaPath} node must be a array`);

        fixer = ValueFixer.from(schema);
        this._fixerCache.set(schemaPath, fixer);

        return fixer;
    }

    _getWhereAllFields(where) {
        if (where instanceof Type.WhereAnd || where instanceof Type.WhereOr) {
            return where.items.reduce((prev, item) => prev.concat(this._getWhereAllFields(item)), []);
        }
        else if (where instanceof Type.WhereNot) {
            return this._getWhereAllFields(where.item);
        }
        else if (
            where instanceof Type.WhereIn || 
            where instanceof Type.WhereBetween ||
            where instanceof Type.WhereLike ||
            where instanceof Type.WhereEq ||
            where instanceof Type.WhereNq ||
            where instanceof Type.WhereGe ||
            where instanceof Type.WhereGt ||
            where instanceof Type.WhereLe ||
            where instanceof Type.WhereLt ||
            where instanceof Type.WhereContain
        ) {
            return [where.field];
        }
    }

    checkData(schemaPath, data) {
        let validator = this._getNodeValidator(schemaPath);
        let isPass = validator.validate(data);
        if (isPass === false) throw new Error(validator.errorsText);
    }

    fixData(schemaPath, data) {
        const {strict} = require('../global');
        if (this._needFix) return this._getNodeFixer(schemaPath).fix(data, strict);
        return data;
    }
}