const assert = require('assert');
const SchemaValidator = require('../../module/validator');
const ValueFixer = require('../../module/fixer');
const Router = require('../../module/router');
const Sugar = require('../../module/sugar');

module.exports = class extends require('../base.js') {
    constructor(name) {
        super();
        const {definitionDir, removeSchemaUndefinedProperties, indexes} = require('../../global');
        this._schema = Sugar.resolve(require(`${definitionDir.relationPath.schema}/${name.split('.').join('/')}`)).normalize();
        this._router = new Router(name, `${definitionDir.relationPath.router}`);
        if (indexes[name] == undefined) { //缓存每个表的索引字段
            indexes[name] = require('../../module/index/index.js').analysis(this._schema).map(({path}) => path).concat('.id', '.subject');
        }
    }

    async fetch(subject, object) {
        let relation = await this._router.relationFetch(subject, object);
        if (relation == undefined) return relation;
        const {removeSchemaUndefinedProperties} = require('../../global');
        relation = ValueFixer.from(this._schema).fix(relation, removeSchemaUndefinedProperties);
        let validator = SchemaValidator.from(this._schema);
        let isPass = validator.validate(relation);
        if (isPass == false) throw new Error(validator.errorText);
        return relation;
    }

    async put(relation) {
        let validator = SchemaValidator.from(this._schema);
        let isPass = validator.validate(relation);
        if (isPass == false) throw new Error(validator.errorText);
        await this._router.relationPut(relation);
    }

    async has(subject, object) {
        return await this._router.relationHas(subject, object);
    }

    async remove(subject, object) {
        await this._router.relationRemove(subject, object);  
    }

    async clear(subject) {
        await this._router.relationClear(subject);  
    }

    async count(subject, filter = undefined) {
        if (filter != undefined) {
            this._getWhereAllFields(filter).forEach(field => assert(this._getNodeSchema(field).default == undefined, `path ${field} node must not has a default value`));
        }
        return await this._router.relationCount(subject, filter);
    }

    async list(subject, sort = undefined, limit = undefined, filter = undefined) {
        if (sort != undefined) {
            [].concat(sort).forEach(({field}) => assert(this._getNodeSchema(field).default == undefined, `path ${field} node must not has a default value`));
        }
        if (filter != undefined) {
            this._getWhereAllFields(filter).forEach(field => assert(this._getNodeSchema(field).default == undefined, `path ${field} node must not has a default value`));
        }

        const {removeSchemaUndefinedProperties} = require('../../global');
        let relations = await this._router.relationList(subject, sort, limit, filter);
        return relations.map(item => {
            item = Object.assign({subject}, item);
            item = ValueFixer.from(this._schema).fix(item, removeSchemaUndefinedProperties);
            let validator = SchemaValidator.from(this._schema);
            let isPass = validator.validate(item);
            if (isPass == false) throw new Error(validator.errorText);
            return item;
        });
    }
}