const SchemaValidator = require('../lib/validator');
const ValueFixer = require('../lib/fixer');
const Router = require('../lib/router');
const Sugar = require('../lib/sugar');
module.exports = class R {
    constructor(name) {
        const {definitionDir, removeSchemaUndefinedProperties, indexes} = require('../global');
        this._schema = Sugar.resolve(require(`${definitionDir.relation}/schema/${name.split('.').join('/')}`)).normalize();
        this._router = new Router(name, `${definitionDir.relation}/router`);
        if (indexes[name] == undefined) { //缓存每个表的索引字段
            indexes[name] = require('../lib/index/index.js').analysis(this._schema).map(({path}) => path).concat('.id', '.subject');
        }
    }

    async fetch(subject, object) {
        let relation = await this._router.relationFetch(subject, object);
        if (relation == undefined) return relation;
        const {removeSchemaUndefinedProperties} = require('../global');
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

    async count(subject) {
        return await this._router.relationCount(subject);
    }

    async list(subject, sort = undefined, limit = undefined) {
        const {removeSchemaUndefinedProperties} = require('../global');
        let relations = await this._router.relationList(subject, sort, limit);
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