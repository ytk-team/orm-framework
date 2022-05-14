const Router = require('../../module/router');
const Logic = require('../../module/logic');
const IndexAnalyser = require('../../module/index/index.js');

module.exports = class extends require('../base.js') {
    constructor(name) {
        const { definitionDir, indexes } = require('../../global');
        super(require(`${definitionDir.objectPath.schema}/${name}`));

        this._router = new Router(name, `${definitionDir.objectPath.router}`);
        if (indexes[name] === undefined) { //缓存每个表的索引字段
            indexes[name] = IndexAnalyser.analysis(this._schema).map(({ path }) => path).concat('.id');
        }
    }

    async get(id) {
        let data = await this._router.objectGet(id);
        if (data === undefined) return undefined;
        return this.fixData(".", data);
    }

    async set(data) {
        this.checkData(".", data);
        await this._router.objectSet(data.id, data);
    }

    async del(id) {
        await this._router.objectDel(id);
    }

    async has(id) {
        return await this._router.objectHas(id);
    }

    async arrayNodeAppend(id, path, ...items) {
        this.checkData(path, items);
        await this._router.objectArrayNodeAppend(id, path, items);
    }

    async arrayNodeUnshift(id, path, ...items) {
        this.checkData(path, items);
        await this._router.objectArrayNodeUnshift(id, path, items);
    }

    async arrayNodeInsert(id, path, index, item) {
        this.checkData(path, [item]);
        await this._router.objectArrayNodeInsert(id, path, index, item);
    }

    async arrayNodeDel(id, path, index) {
        await this._router.objectArrayNodeDel(id, path, index);
    }

    async arrayNodePop(id, path) {
        let data = await this._router.objectArrayNodePop(id, path);
        return this.fixData(path, [data])[0];
    }

    async arrayNodeShift(id, path) {
        let data = await this._router.objectArrayNodeShift(id, path);
        return this.fixData(path, [data])[0];
    }

    async find(params) {
        let { where = undefined, sort = undefined, limit = undefined,group = undefined } = params || {};

        //支持json格式的logic表达式查询
        if (where !== undefined) where = Logic.normalize(where);
        if (group !== undefined) group = Logic.normalize(group);
        if (sort !== undefined) sort = Logic.normalize(sort);
        if (limit !== undefined) limit = Logic.normalize(limit);

        let rows = await this._router.objectFind({ where, sort, limit, group });
        if (rows.length === 0) return rows;

        return rows.map(row => this.fixData(".", row));
    }

    async count(where = undefined,group = undefined) {
        //支持json格式的logic表达式查询
        if (where !== undefined) where = Logic.normalize(where);
        if (group !== undefined) group = Logic.normalize(group);
        return await this._router.objectCount(where,group);
    }

    async fieldFind(params) {
        let { field = undefined, where = undefined, sort = undefined, limit = undefined, group = undefined } = params || {};
        if (field !== undefined) field = Logic.normalize(field);
        if (group !== undefined) group = Logic.normalize(group);
        if (where !== undefined) where = Logic.normalize(where);
        if (sort !== undefined) sort = Logic.normalize(sort);
        if (limit !== undefined) limit = Logic.normalize(limit);

        let rows = await this._router.objectFieldFind({ field, where, sort, limit, group });
        if (rows.length === 0) return rows;

        return rows.map(row => this.fixData(".", row));
    }

    async query(sql){
        let rows = await this._router.objectQuery(sql);
        if (rows.length === 0) return rows;
        return rows.map(row => this.fixData(".", row));
    }


}