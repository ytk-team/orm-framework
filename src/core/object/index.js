const assert = require('assert');
const SchemaValidator = require('../../module/validator');
const ValueFixer = require('../../module/fixer');
const Router = require('../../module/router');
const Sugar = require('../../module/sugar');

module.exports = class extends require('../base.js') {
    constructor(name) {
        super();
        const {definitionDir, removeSchemaUndefinedProperties, indexes} = require('../../global');
        this._schema = Sugar.resolve(require(`${definitionDir.objectPath.schema}/${name}`)).normalize();
        this._router = new Router(name, `${definitionDir.objectPath.router}`);
        if (indexes[name] == undefined) { //缓存每个表的索引字段
            indexes[name] = require('../../module/index/index.js').analysis(this._schema).map(({path}) => path).concat('.id');
        }
    }

    async get(id) {
        const {removeSchemaUndefinedProperties} = require('../../global');
        let obj = await this._router.objectGet(id);
        if (obj === undefined) return undefined;
        obj = Object.assign({id}, obj);
        obj = ValueFixer.from(this._schema).fix(obj, removeSchemaUndefinedProperties);
        let validator = SchemaValidator.from(this._schema);
        let isPass = validator.validate(obj);
        if (isPass == false) throw new Error(validator.errorText);
        return obj;
    }

    async set(obj) {
        obj = ValueFixer.from(this._schema).fix(obj);
        let validator = SchemaValidator.from(this._schema);
        let isPass = validator.validate(obj);
        if (isPass == false) throw new Error(validator.errorText);
        await this._router.objectSet(String(obj.id), obj);
    }

    async del(id) {
        await this._router.objectDel(id);
    }

    async has(id) {
        return await this._router.objectHas(id);
    }

    async arrayNodeAppend(id, path, ...items) {
        let schema = this._getNodeSchema(path);
        assert(schema.type == 'array', `path ${path} node must be a array`);
        assert(schema.default == undefined, `path ${path} node must not has a default value`);
        let validator = SchemaValidator.from(schema);
        let isPass = validator.validate(items);
        if (isPass == false) throw new Error(validator.errorText);

        await this._router.objectArrayNodeAppend(id, path, items);
    }

    async arrayNodeUnshift(id, path, ...items) {
        let schema = this._getNodeSchema(path);
        assert(schema.type == 'array', `path ${path} node must be a array`);
        assert(schema.default == undefined, `path ${path} node must not has a default value`);
        let validator = SchemaValidator.from(schema);
        let isPass = validator.validate(items);
        if (isPass == false) throw new Error(validator.errorText);

        await this._router.objectArrayNodeUnshift(id, path, items);
    }

    async arrayNodeInsert(id, path, index, item) {
        let schema = this._getNodeSchema(path);
        assert(schema.type == 'array', `path ${path} node must be a array`);
        assert(schema.default == undefined, `path ${path} node must not has a default value`);
        let validator = SchemaValidator.from(schema);
        let isPass = validator.validate([item]);
        if (isPass == false) throw new Error(validator.errorText);

        await this._router.objectArrayNodeInsert(id, path, index, item);
    }

    async arrayNodeDel(id, path, index) {
        let schema = this._getNodeSchema(path);
        assert(schema.type == 'array', `path ${path} node must be a array`);
        assert(schema.default == undefined, `path ${path} node must not has a default value`);
        await this._router.objectArrayNodeDel(id, path, index);
    }

    async arrayNodePop(id, path) {
        let schema = this._getNodeSchema(path);
        assert(schema.type == 'array', `path ${path} node must be a array`);
        assert(schema.default == undefined, `path ${path} node must not has a default value`);
        const {removeSchemaUndefinedProperties} = require('../../global');
        let obj = await this._router.objectArrayNodePop(id, path);
        if (obj === undefined) return undefined;
        obj = ValueFixer.from(schema.items).fix(obj, removeSchemaUndefinedProperties);
        let validator = SchemaValidator.from(schema.items);
        let isPass = validator.validate(obj);
        if (isPass == false) throw new Error(validator.errorText);
        return obj;
    }

    async arrayNodeShift(id, path) {
        let schema = this._getNodeSchema(path);
        assert(schema.type == 'array', `path ${path} node must be a array`);
        assert(schema.default == undefined, `path ${path} node must not has a default value`);
        const {removeSchemaUndefinedProperties} = require('../../global');
        let obj = await this._router.objectArrayNodeShift(id, path);
        if (obj === undefined) return undefined;
        obj = ValueFixer.from(schema.items).fix(obj, removeSchemaUndefinedProperties);
        let validator = SchemaValidator.from(schema.items);
        let isPass = validator.validate(obj);
        if (isPass == false) throw new Error(validator.errorText);
        return obj;
    }

    async find(params) {
        let {where = undefined, sort = undefined, limit = undefined} = params || {};
        if (where != undefined) {
            this._getWhereAllFields(where).forEach(field => assert(this._getNodeSchema(field).default == undefined, `path ${field} node must not has a default value`));
        }
        if (sort != undefined) {
            [].concat(sort).forEach(({field}) => assert(this._getNodeSchema(field).default == undefined, `path ${field} node must not has a default value`));
        }
        const {removeSchemaUndefinedProperties} = require('../../global');
        let rows = await this._router.objectFind({where, sort, limit});
        if (rows.length === 0) return rows;
        rows = rows.map(row => ValueFixer.from(this._schema).fix(row, removeSchemaUndefinedProperties));
        let validator = SchemaValidator.from(this._schema);
        rows.forEach(row => {
            let isPass = validator.validate(row);
            if (isPass == false) throw new Error(validator.errorText);
        })
        return rows;
    }

    async count(where = undefined) {
        if (where != undefined) {
            this._getWhereAllFields(where).forEach(field => assert(this._getNodeSchema(field).default == undefined, `path ${field} node must not has a default value`));
        }
        return await this._router.objectCount(where);
    }
}