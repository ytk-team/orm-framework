const assert = require('assert');
const SchemaValidator = require('../../module/validator');
const ValueFixer = require('../../module/fixer');
const Router = require('../../module/router');
const Sugar = require('../../module/sugar');
const Logic = require('../../module/logic');
const LogicBase = require('../../module/logic/base');
module.exports = class extends require('../base.js') {
    constructor(name) {
        super();
        const {definitionDir, strict, indexes} = require('../../global');
        this._schema = Sugar.resolve(require(`${definitionDir.relationPath.schema}/${name.split('.').join('/')}`)).normalize();
        this._router = new Router(name, `${definitionDir.relationPath.router}`);
        if (indexes[name] == undefined) { //缓存每个表的索引字段
            indexes[name] = require('../../module/index/index.js').analysis(this._schema).map(({path}) => path).concat('.id', '.subject');
        }
    }

    async fetch(subject, object) {
        let relation = await this._router.relationFetch(subject, object);
        if (relation == undefined) return relation;
        const {strict} = require('../../global');
        relation = ValueFixer.from(this._schema).fix(relation, strict);
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
        //支持json格式的logic表达式查询
        if (filter !== undefined && !(filter instanceof LogicBase)) filter = Logic.toLogic(filter);
        return await this._router.relationCount(subject, filter);
    }

    async list(subject, sort = undefined, limit = undefined, filter = undefined) {
        //支持json格式的logic表达式查询
        if (filter !== undefined && !(filter instanceof LogicBase)) filter = Logic.toLogic(filter);
        if (sort !== undefined) {
            if (Array.isArray(sort) && sort.every(_ => !(_ instanceof LogicBase))) {
                sort = sort.map(_ => Logic.toLogic(_));
            }
            else if (!Array.isArray(sort) && !(sort instanceof LogicBase)) {
                sort = Logic.toLogic(sort);
            }
        }
        if (limit !== undefined && !(limit instanceof LogicBase)) limit = Logic.toLogic(limit);

        const {strict} = require('../../global');
        let relations = await this._router.relationList(subject, sort, limit, filter);
        return relations.map(item => {
            item = Object.assign({subject}, item);
            item = ValueFixer.from(this._schema).fix(item, strict);
            let validator = SchemaValidator.from(this._schema);
            let isPass = validator.validate(item);
            if (isPass == false) throw new Error(validator.errorText);
            return item;
        });
    }
}