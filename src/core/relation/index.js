const Router = require('../../module/router');
const Logic = require('../../module/logic');
const IndexAnalyser = require('../../module/index/index.js');
module.exports = class extends require('../base.js') {
    constructor(name) {
        const {definitionDir, indexes} = require('../../global');
        super(require(`${definitionDir.relationPath.schema}/${name.split('.').join('/')}`));

        this._router = new Router(name, `${definitionDir.relationPath.router}`);
        if (indexes[name] === undefined) { //缓存每个表的索引字段
            indexes[name] = IndexAnalyser.analysis(this._schema).map(({path}) => path).concat('.id', '.subject');
        }
    }

    async fetch(subject, object) {
        let data = await this._router.relationFetch(subject, object);
        if (data === undefined) return data;
        return this.fixData(".", data);
    }

    async put(data) {
        this.checkData(".", data);
        await this._router.relationPut(data);
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
        if (filter !== undefined) filter = Logic.normalize(filter);
        return await this._router.relationCount(subject, filter);
    }

    async list(subject, sort = undefined, limit = undefined, filter = undefined) {
        //支持json格式的logic表达式查询
        if (filter !== undefined) filter = Logic.normalize(filter);
        if (sort !== undefined) sort = Logic.normalize(sort);
        if (limit !== undefined) limit = Logic.normalize(limit);

        let data = await this._router.relationList(subject, sort, limit, filter);

        return data.map(item => this.fixData(".", item));
    }
}