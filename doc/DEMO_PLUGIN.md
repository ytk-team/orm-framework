# Redis媒介插件代码
## 插件代码
```js
const assert = require('assert');
const Pool = require('./pool');
const Type = require('@qtk/orm-framework').Type;

module.exports = class extends ORM.BackendMedia {
    constructor(connParam, indexes) {
        super(connParam, indexes);
        this._support = {
            objectFind: false,
            objectCount: false,
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
            assert(value != undefined, 'can not find record');
            this._getNodeValue(value, path).push(...items);
            await this.objectSet(id, value);
        });
    }

    async objectArrayNodeUnshift(id, path, items) {
        await this._mutex.lock(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            assert(value != undefined, 'can not find record');
            let array = this._getNodeValue(value, path)
            items.forEach(item => array.unshift(item));
            await this.objectSet(id, value);
        });
    }

    async objectArrayNodeInsert(id, path, index, item) {
        await this._mutex.lock(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            assert(value != undefined, 'can not find record');
            this._getNodeValue(value, path).splice(index, 0, item);
            await this.objectSet(id, value);
        });
    }

    async objectArrayNodeDel(id, path, index) {
        await this._mutex.lock(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            assert(value != undefined, 'can not find record');
            this._getNodeValue(value, path).splice(index, 1);
            await this.objectSet(id, value);
        });
    }

    async objectArrayNodePop(id, path) {
        return await this._mutex.lock(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            assert(value != undefined, 'can not find record');
            let item = this._getNodeValue(value, path).pop();
            await this.objectSet(id, value);
            return item;
        });
    }

    async objectArrayNodeShift(id, path) {
        return await this._mutex.lock(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            assert(value != undefined, 'can not find record');
            let item = this._getNodeValue(value, path).shift();
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

    async relationList(subject, sort = undefined, limit = undefined, filter = undefined) {
        let list = (await this._execute('hvals', `${this._connParam.bucket}.${subject}`)).map(_ => JSON.parse(_));
        if (filter != undefined) list = list.filter(_ => this._assert(filter, _));
        if (sort != undefined) {
            [].concat(sort).map(({field, order}) => {
                list.sort((l, r) => order == "ASC" ? this._getNodeValue(l, field) - this._getNodeValue(r, field) : this._getNodeValue(r, field) - this._getNodeValue(l, field));
            })
        }
        if (limit != undefined) {
            list = list.slice(limit.skip, limit.skip + limit.limit);
        }
        return list;
    }

    async relationCount(subject, filter = undefined) {
        if (filter == undefined) {
            return await this._execute('hlen', `${this._connParam.bucket}.${subject}`);
        }
        else {
            return (await this.relationList(subject, undefined, undefined, filter)).length;
        }
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

    _getNodeValue(object, path) {
        return path.split('.').slice(1).reduce((prev, curr) => {
            if (curr == '') return prev;
            if (/\[\*\]/.test(curr)) { //[*]获取数组所有元素
                return object[curr.substring(0, curr.length - 3)];
            }
            else if (/\[(\d+)\]/.test(curr)) {
                return object[parseInt(curr.match(/\[(\d+)\]/)[1])];
            }
            else {
                return typeof object === "array" ? object.map(_ => _[curr]) : object[curr];
            }
        }, object);
    }

    _assert(where, item) {
        if (where instanceof Type.WhereAnd) {
            return where.items.every(_ => this._assert(_, item));
        }
        else if (where instanceof Type.WhereOr) {
            return where.items.some(_ => this._assert(_, item));
        }
        else if (where instanceof Type.WhereNot) {
            return !this._assert(where.item, item);
        }
        else if (where instanceof Type.WhereIn) {
            return where.items.includes(this._getNodeValue(item, where.field));
        }
        else if (where instanceof Type.WhereBetween) {
            let value = this._getNodeValue(item, where.field);
            return value >= where.from && value <= where.to;
        }
        else if (where instanceof Type.WhereLike) {
            let escape = false;
            let context = where.value.replace(/\\\\\\\\/g, "\\\\")
                .split('')
                .map((value, index, arr) => {
                    switch(value) {
                        case "_":
                            var _ = index == 0 || escape == false ? '(.{1})' : value;
                            if (escape) escape = !escape;
                            return _;
                        case "%":
                            var _ = index == 0 || escape == false ? '(.*)' : value;
                            if (escape) escape = !escape;
                            return _;
                        case "\\":
                            escape = !escape;
                        default:
                            return value;
                    }
                }).join('');
            let regex = new RegExp(`${['%', '_'].includes(where.value.substr(0, 1))  ? "" : "^"}${context}${['%', '_'].includes(where.value.substr(-1, 1)) ? "" : "$"}`);
            return regex.test(this._getNodeValue(item, where.field));
        }
        else if (where instanceof Type.WhereEq) {
            return eval(`${this._getNodeValue(item, where.field)} == ${where.value}`);
        }
        else if (where instanceof Type.WhereNq) {
            return eval(`${this._getNodeValue(item, where.field)} <> ${where.value}`);
        }
        else if (where instanceof Type.WhereGe) {
            return eval(`${this._getNodeValue(item, where.field)} >= ${where.value}`);
        }
        else if (where instanceof Type.WhereGt) {
            return eval(`${this._getNodeValue(item, where.field)} > ${where.value}`);
        }
        else if (where instanceof Type.WhereLe) {
            return eval(`${this._getNodeValue(item, where.field)} <= ${where.value}`);
        }
        else if (where instanceof Type.WhereLt) {
            return eval(`${this._getNodeValue(item, where.field)} < ${where.value}`);
        }
        else if (where instanceof Type.WhereContain) {
            return this._getNodeValue(item, where.field).includes(where.value);
        }
    }
};
```

## 路由定义
```js
module.exports = {
    cache: {
        shards: [
            {
                media: "redis",
                host: "127.0.0.1",
                port: 6379,
                bucket: "db_orm.o_message",
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    }
};
```
## 使用方式
```js
const ORM = require('@qtk/orm-framework');
ORM.setup({
    objectSchemaPath: `${__dirname}/config/object/schema`,
    objectRouterPath: `${__dirname}/config/object/router`,
    relationSchemaPath: `${__dirname}/config/relation/schema`,
    relationRouterPath: `${__dirname}/config/relation/router`,
});
ORM.registryMedia(require('./index.js'));
const ObjectUser = new ORM.Object('user');
await ObjectMessage.set(message);
```