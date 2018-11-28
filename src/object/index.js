const SchemaValidator = require('../lib/validator');
const ValueFixer = require('../lib/fixer');
const Router = require('../lib/router');
const Sugar = require('../lib/sugar');
module.exports = class {
    constructor(name) {
        const {definitionDir, removeSchemaUndefinedProperties, indexes} = require('../global');
        this._schema = Sugar.resolve(require(`${definitionDir.object}/schema/${name}`)).normalize();
        this._router = new Router(name, `${definitionDir.object}/router`);
        if (indexes[name] == undefined) { //缓存每个表的索引字段
            indexes[name] = require('../lib/index/index.js').analysis(this._schema).map(({path}) => path).concat('.id');
        }
    }

    async get(id) {
        const {removeSchemaUndefinedProperties} = require('../global');
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
        let validator = SchemaValidator.from(schema);
        let isPass = validator.validate(items);
        if (isPass == false) throw new Error(validator.errorText);

        await this._router.objectArrayNodeAppend(id, path, items);
    }

    async arrayNodeUnshift(id, path, ...items) {
        let schema = this._getNodeSchema(path);
        let validator = SchemaValidator.from(schema);
        let isPass = validator.validate(items);
        if (isPass == false) throw new Error(validator.errorText);

        await this._router.objectArrayNodeUnshift(id, path, items);
    }

    async arrayNodeInsert(id, path, index, item) {
        let schema = this._getNodeSchema(path);
        let validator = SchemaValidator.from(schema);
        let isPass = validator.validate([item]);
        if (isPass == false) throw new Error(validator.errorText);

        await this._router.objectArrayNodeInsert(id, path, index, item);
    }

    async arrayNodeDel(id, path, index) {
        await this._router.objectArrayNodeDel(id, path, index);
    }

    async arrayNodePop(id, path) {
        const {removeSchemaUndefinedProperties} = require('../global');
        let obj = await this._router.objectArrayNodePop(id, path);
        if (obj === undefined) return undefined;
        let schema = this._getNodeSchema(path).items;
        obj = ValueFixer.from(schema).fix(obj, removeSchemaUndefinedProperties);
        let validator = SchemaValidator.from(schema);
        let isPass = validator.validate(obj);
        if (isPass == false) throw new Error(validator.errorText);
        return obj;
    }

    async arrayNodeShift(id, path) {
        const {removeSchemaUndefinedProperties} = require('../global');
        let obj = await this._router.objectArrayNodeShift(id, path);
        if (obj === undefined) return undefined;
        let schema = this._getNodeSchema(path).items;
        obj = ValueFixer.from(schema).fix(obj, removeSchemaUndefinedProperties);
        let validator = SchemaValidator.from(schema);
        let isPass = validator.validate(obj);
        if (isPass == false) throw new Error(validator.errorText);
        return obj;
    }

    async find(params) {
        let {where = undefined, sort = undefined, limit = undefined} = params || {};
        const {removeSchemaUndefinedProperties} = require('../global');
        let rows = await this._router.find({where, sort, limit});
        if (rows.length === 0) return rows;
        rows = rows.map(row => ValueFixer.from(this._schema).fix(row, removeSchemaUndefinedProperties));
        let validator = SchemaValidator.from(this._schema);
        rows.forEach(row => {
            let isPass = validator.validate(row);
            if (isPass == false) throw new Error(validator.errorText);
        })
        return rows;
    }

    _getNodeSchema(path) {
        return path.split('.').slice(1).reduce((prev, curr) => {
            if (curr == '') return prev;
            if (prev.type == "object") {
                return (prev.properties || prev.patternProperties)[curr];
            }
            else if (prev.type == "array") {
                return prev.items;
            }
            else {
                throw new Error(`invalid node ${key}`);
            }
            
        }, this._schema);
    }
}