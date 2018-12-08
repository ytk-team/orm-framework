const assert = require('assert');
const SchemaValidator = require('../../module/validator');
const ValueFixer = require('../../module/fixer');
const Router = require('../../module/router');
const Sugar = require('../../module/sugar');

module.exports = class extends require('../base.js') {
    constructor(name) {
        super();
        const {definitionDir, strict, indexes} = require('../../global');
        this._schema = Sugar.resolve(require(`${definitionDir.objectPath.schema}/${name}`)).normalize();
        this._router = new Router(name, `${definitionDir.objectPath.router}`);
        if (indexes[name] == undefined) { //缓存每个表的索引字段
            indexes[name] = require('../../module/index/index.js').analysis(this._schema).map(({path}) => path).concat('.id');
        }
    }

    async get(id) {
        const {strict} = require('../../global');
        let obj = await this._router.objectGet(id);
        if (obj === undefined) return undefined;
        obj = Object.assign({id}, obj);
        obj = ValueFixer.from(this._schema).fix(obj, strict);
        let validator = SchemaValidator.from(this._schema);
        let isPass = validator.validate(obj);
        if (isPass == false) throw new Error(validator.errorText);
        return obj;
    }

    async set(obj) {
        obj = ValueFixer.from(this._schema).fix(obj, true);
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
        let validator = SchemaValidator.from(schema);
        let isPass = validator.validate(items);
        if (isPass == false) throw new Error(validator.errorText);

        await this._router.objectArrayNodeAppend(id, path, items);
    }

    async arrayNodeUnshift(id, path, ...items) {
        let schema = this._getNodeSchema(path);
        assert(schema.type == 'array', `path ${path} node must be a array`);
        let validator = SchemaValidator.from(schema);
        let isPass = validator.validate(items);
        if (isPass == false) throw new Error(validator.errorText);

        await this._router.objectArrayNodeUnshift(id, path, items);
    }

    async arrayNodeInsert(id, path, index, item) {
        let schema = this._getNodeSchema(path);
        assert(schema.type == 'array', `path ${path} node must be a array`);
        let validator = SchemaValidator.from(schema);
        let isPass = validator.validate([item]);
        if (isPass == false) throw new Error(validator.errorText);

        await this._router.objectArrayNodeInsert(id, path, index, item);
    }

    async arrayNodeDel(id, path, index) {
        let schema = this._getNodeSchema(path);
        assert(schema.type == 'array', `path ${path} node must be a array`);
        await this._router.objectArrayNodeDel(id, path, index);
    }

    async arrayNodePop(id, path) {
        let schema = this._getNodeSchema(path);
        assert(schema.type == 'array', `path ${path} node must be a array`);
        const {strict} = require('../../global');
        let obj = await this._router.objectArrayNodePop(id, path);
        if (obj === undefined) return undefined;
        obj = ValueFixer.from(schema.items).fix(obj, strict);
        let validator = SchemaValidator.from(schema.items);
        let isPass = validator.validate(obj);
        if (isPass == false) throw new Error(validator.errorText);
        return obj;
    }

    async arrayNodeShift(id, path) {
        let schema = this._getNodeSchema(path);
        assert(schema.type == 'array', `path ${path} node must be a array`);
        const {strict} = require('../../global');
        let obj = await this._router.objectArrayNodeShift(id, path);
        if (obj === undefined) return undefined;
        obj = ValueFixer.from(schema.items).fix(obj, strict);
        let validator = SchemaValidator.from(schema.items);
        let isPass = validator.validate(obj);
        if (isPass == false) throw new Error(validator.errorText);
        return obj;
    }

    async find(params) {
        let {where = undefined, sort = undefined, limit = undefined} = params || {};
        const {strict} = require('../../global');
        let rows = await this._router.objectFind({where, sort, limit});
        if (rows.length === 0) return rows;
        rows = rows.map(row => ValueFixer.from(this._schema).fix(row, strict));
        let validator = SchemaValidator.from(this._schema);
        rows.forEach(row => {
            let isPass = validator.validate(row);
            if (isPass == false) throw new Error(validator.errorText);
        })
        return rows;
    }

    async count(where = undefined) {
        return await this._router.objectCount(where);
    }
}