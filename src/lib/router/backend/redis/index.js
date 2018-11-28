const Pool = require('./pool');
module.exports = class extends require('../base.js') {
    constructor(connParam, indexes) {
        super(connParam, indexes);
        this._support = {
            find: false,
            objectArrayNodeAppend: true,
            objectArrayNodeUnshift: true,
            objectArrayNodeInsert: true,
            objectArrayNodeDel: true,
            objectArrayNodePop: true,
            objectArrayNodeShift: true
        }
        this._mutex = require('process-key-mutex');
    }

    static get media() {
        return 'redis';
    }

    async objectGet(id) {
        let result = await this._execute('get', `${this._connParam.bucket}.${id}`);
        return result == null ? undefined : JSON.parse(result);
    }

    async objectSet(id, value) {
        await this._execute('set', `${this._connParam.bucket}.${id}`, JSON.stringify(value));
    }

    async objectDel(id) {
        await this._execute('del', `${this._connParam.bucket}.${id}`);
    }

    async objectHas(id) {
        return Boolean(await this._execute('exists', `${this._connParam.bucket}.${id}`));
    }

    async objectArrayNodeAppend(id, path, items) {
        await this._mutex.lock(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            this._getNode(value, path).push(...items);
            await this.objectSet(id, value);
        });
    }

    async objectArrayNodeUnshift(id, path, items) {
        await this._mutex.lock(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            let array = this._getNode(value, path)
            items.forEach(item => array.unshift(item));
            await this.objectSet(id, value);
        });
    }

    async objectArrayNodeInsert(id, path, index, item) {
        await this._mutex.lock(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            this._getNode(value, path).splice(index, 0, item);
            await this.objectSet(id, value);
        });
    }

    async objectArrayNodeDel(id, path, index) {
        await this._mutex.lock(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            this._getNode(value, path).splice(index, 1);
            await this.objectSet(id, value);
        });
    }

    async objectArrayNodePop(id, path) {
        return await this._mutex.lock(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            let item = this._getNode(value, path).pop();
            await this.objectSet(id, value);
            return item;
        });
    }

    async objectArrayNodeShift(id, path) {
        return await this._mutex.lock(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            let item = this._getNode(value, path).shift();
            await this.objectSet(id, value);
            return item;
        });
    }

    async relationFetch(subject, object) {
        let result = await this._execute('hget', `${this._connParam.bucket}.${subject}`, object);
        return result == null ? undefined : JSON.parse(result);
    }

    async relationPut(relation) {
        await this._execute('hset', `${this._connParam.bucket}.${relation.subject}`, relation.object, JSON.stringify(relation));
    }

    async relationHas(subject, object) {
        return Boolean(await this._execute('hexists', `${this._connParam.bucket}.${subject}`, object));
    }

    async relationRemove(subject, object) {
        await this._execute('hdel', `${this._connParam.bucket}.${subject}`, object);
    }

    async relationList(subject, sort = undefined, limit = undefined) {
        let list = (await this._execute('hvals', `${this._connParam.bucket}.${subject}`)).map(_ => JSON.parse(_));
        if (sort != undefined) {
            let {field, order} = sort;
            list.sort((l, r) => order == "ASC" ? this._getNode(l, field) - this._getNode(r, field) : this._getNode(r, field) - this._getNode(l, field));
        }
        if (limit != undefined) {
            list = list.slice(limit.skip, limit.skip + limit.limit);
        }
        return list;
    }

    async relationCount(subject) {
        return await this._execute('hlen', `${this._connParam.bucket}.${subject}`);
    }

    async relationClear(subject) {
        await this._execute('del', `${this._connParam.bucket}.${subject}`);
    }

    async _execute(method, ...params) {
        let redis = Pool.fetch(this._connParam);
        return new Promise((resolve, reject) => {
            redis[method](...params, (error, result) => {
                if (error != undefined) return reject(error);
                return resolve(result);
            })
        })
    }

    _getNode(object, path) {
        return path.split('.').slice(1).reduce((prev, curr) => {
            if (curr == '') return prev;
            if (/\[(\d+)\]/.test(curr)) {
                return object[parseInt(curr.match(/\[(\d+)\]/)[1])];
            }
            else {
                return object[curr];
            }
        }, object);
    }
};