/**
 * find,count暂不支持热迁移，会影响性能
 */

const assert = require('assert');
const fs = require('fs');
const Backend = require('./backend')

module.exports = class Wrapper {
    constructor(name, routerPath) {
        this._routerCurrent = new Router(name, require(`${routerPath}/${name.replace(/\./g, '/')}.js`));
        if (fs.existsSync(`${routerPath}/${name.replace(/\./g, '/')}.deprecated.js`)) {
            this._routerDeprecated = new Router(name, require(`${routerPath}/${name.replace(/\./g, '/')}.deprecated.js`));
        }
    }

    async objectGet(id) {
        let value = await this._routerCurrent.objectGet(id);
        if ((value === undefined) && (this._routerDeprecated !== undefined)) {
            value = await this._routerDeprecated.objectGet(id);
            if (value !== undefined) {
                await this._routerCurrent.objectSet(id, value);
            }
        }
        return value;
    }

    async objectSet(id, value) {
        await this._routerCurrent.objectSet(id, value);
    }

    async objectDel(id) {
        let pendings = [this._routerCurrent.objectDel(id)];
        if (this._routerDeprecated !== undefined) {
            pendings.push(this._routerDeprecated.objectDel(id));
        }
        await Promise.all(pendings);
    }

    async objectHas(id) {
        let value = await this._routerCurrent.objectHas(id);
        if ((value === false) && (this._routerDeprecated !== undefined)) {
            value = await this._routerDeprecated.objectHas(id);
            if (value !== false) {
                await this._routerCurrent.objectSet(id, await this._routerDeprecated.objectGet(id));
            }
        }
        return value;
    }

    async relationFetch(subject, object) {
        let relation = await this._routerCurrent.relationFetch(subject, object);
        if ((relation === undefined) && (this._routerDeprecated !== undefined)) {
            relation = await this._routerDeprecated.relationFetch(subject, object);
        }
        return relation;
    }

    async relationPut(relation) {
        await this._routerCurrent.relationPut(relation);
    }

    async relationHas(subject, object) {
        let value = await this._routerCurrent.relationHas(subject, object);
        if ((value === false) && (this._routerDeprecated !== undefined)) {
            value = await this._routerDeprecated.relationHas(subject, object);
            if (value !== false) {
                await this._routerCurrent.relationPut(await this._routerDeprecated.relationFetch(subject, object));
            }
        }
        return value;
    }

    async relationRemove(subject, object) {
        let pendings = [this._routerCurrent.relationRemove(subject, object)];
        if (this._routerDeprecated !== undefined) {
            pendings.push(this._routerDeprecated.relationRemove(subject, object));
        }
        await Promise.all(pendings);
    }

    async relationList(subject, sort = undefined, limit = undefined) {
        let relation = await this._routerCurrent.relationList(subject, sort, limit);
        if ((relation.length === 0) && (this._routerDeprecated !== undefined)) {
            relation = await this._routerDeprecated.relationList(subject, sort, limit);
        }
        return relation;
    }

    async relationCount(subject) {
        let count = await this._routerCurrent.relationCount(subject);
        if ((count === 0) && (this._routerDeprecated !== undefined)) {
            count = await this._routerDeprecated.relationCount(subject);
        }
        return count;
    }

    async relationClear(subject) {
        let pendings = [this._routerCurrent.relationClear(subject)];
        if (this._routerDeprecated !== undefined) {
            pendings.push(this._routerDeprecated.relationClear(subject));
        }
        await Promise.all(pendings);
    }

    async objectArrayNodeAppend(id, path, items) {
        await this._routerCurrent.objectArrayNodeAppend(id, path, items);
    }

    async objectArrayNodeUnshift(id, path, items) {
        await this._routerCurrent.objectArrayNodeUnshift(id, path, items);
    }

    async objectArrayNodeInsert(id, path, index, item) {
        await this._routerCurrent.objectArrayNodeInsert(id, path, index, item);
    }

    async objectArrayNodeDel(id, path, index) {
        const pendings = [this._routerCurrent.objectArrayNodeDel(id, path, index)];
        if (this._routerDeprecated !== undefined) {
            pendings.push(this._routerDeprecated.objectArrayNodeDel(id, path, index));
        }
        
        await Promise.all(pendings);
    }

    async objectArrayNodePop(id, path) {
        let value = await this._routerCurrent.objectArrayNodePop(id, path);
        if ((value === undefined) && (this._routerDeprecated !== undefined)) {
            value = await this._routerDeprecated.objectArrayNodePop(id, path);
            if (value !== undefined) {
                await this._routerCurrent.set(id, await this._routerDeprecated.get(id));
            }
        }
        return value;
    }

    async objectArrayNodeShift(id, path) {
        let value = await this._routerCurrent.objectArrayNodeShift(id, path);
        if ((value === undefined) && (this._routerDeprecated !== undefined)) {
            value = await this._routerDeprecated.objectArrayNodeShift(id, path);
            if (value !== undefined) {
                await this._routerCurrent.set(id, await this._routerDeprecated.get(id));
            }
        }
        return value;
    }

    async find({where, sort, limit}) {
        let value = await this._routerCurrent.find({where, sort, limit});
        if ((value.length === 0) && (this._routerDeprecated !== undefined)) {
            value = await this._routerDeprecated.find({where, sort, limit});
        }
        return value;
    }
}

class Router {
    constructor(moduleName, {cache, persistence}) {
        this._cache = cache;
        this._persistence = persistence;
        this._moduleName = moduleName;
        assert(this._cache !== undefined || this._persistence !== undefined, `either cache and persistence is needed in router sepcification`);
    }

    _resolveMedia(id) {
        const {indexes} = require('../../global');
        let cache = undefined;
        let persistence = undefined;
        if (this._cache !== undefined) {
            cache = Backend.create(this._cache.hash(id), indexes[this._moduleName]);
        }
        if (this._persistence !== undefined) {
            persistence = Backend.create(this._persistence.hash(id), indexes[this._moduleName]);
        }
        return {cache, persistence};
    }

    async objectGet(id) {
        const {cache, persistence} = this._resolveMedia(id);
        let value = undefined;
        if (cache !== undefined) value = await cache.objectGet(id);
        if (value !== undefined) return value;
        if (persistence !== undefined) value = await persistence.objectGet(id);
        return value;
   }

    async objectSet(id, value) {
        const {cache, persistence} = this._resolveMedia(id);
        const pendings = [];
        if (cache !== undefined) pendings.push(cache.objectSet(id, value));
        if (persistence !== undefined) pendings.push(persistence.objectSet(id, value));
        await Promise.all(pendings);
    }

    async objectDel(id) {
        const {cache, persistence} = this._resolveMedia(id);
        const pendings = [];
        if (cache !== undefined) pendings.push(cache.objectDel(id));
        if (persistence !== undefined) pendings.push(persistence.objectDel(id));
        await Promise.all(pendings);
    }

    async objectHas(id) {
        const {cache, persistence} = this._resolveMedia(id);
        let value = false;
        if (cache !== undefined) value = await cache.objectHas(id);
        if (value == true) return value;
        if (persistence !== undefined) value = await persistence.objectHas(id);
        return value;
    }

    async relationFetch(subject, object) {
        const {cache, persistence} = this._resolveMedia(subject);
        let value = undefined;
        if (cache !== undefined) value = await cache.relationFetch(subject, object);
        if (value !== undefined) return value;
        if (persistence !== undefined) value = await persistence.relationFetch(subject, object);
        return value;
    }

    async relationPut(relation) {
        const {cache, persistence} = this._resolveMedia(relation.subject);
        const pendings = [];
        if (cache !== undefined) pendings.push(cache.relationPut(relation));
        if (persistence !== undefined) pendings.push(persistence.relationPut(relation));
        await Promise.all(pendings);
    }

    async relationRemove(subject, object) {
        const {cache, persistence} = this._resolveMedia(subject);
        const pendings = [];
        if (cache !== undefined) pendings.push(cache.relationRemove(subject, object));
        if (persistence !== undefined) pendings.push(persistence.relationRemove(subject, object));
        await Promise.all(pendings);
    }

    async relationHas(subject, object) {
        const {cache, persistence} = this._resolveMedia(subject);
        let value = false;
        if (cache !== undefined) value = await cache.relationHas(subject, object);
        if (value == true) return value;
        if (persistence !== undefined) value = await persistence.relationHas(subject, object);
        return value;
    }

    async relationList(subject, sort, limit) {
        const {cache, persistence} = this._resolveMedia(subject);
        let relation = [];
        if (cache !== undefined) relation = await cache.relationList(subject, sort, limit);
        if (relation.length != 0) return relation;
        if (persistence !== undefined) relation = await persistence.relationList(subject, sort, limit);
        return relation;
    }
    
    async relationCount(subject) {
        const {cache, persistence} = this._resolveMedia(subject);
        let count = 0;
        if (cache !== undefined) count = await cache.relationCount(subject);
        if (count != 0) return count;
        if (persistence !== undefined) count = await persistence.relationCount(subject);
        return count;
    }

    async relationClear(subject) {
        const pendings = [];
        const {cache, persistence} = this._resolveMedia(subject);
        if (cache !== undefined) pendings.push(cache.relationClear(subject));
        if (persistence !== undefined) pendings.push(persistence.relationClear(subject));
        await Promise.all(pendings);
    }

    async objectArrayNodeAppend(id, path, items) {
        const {cache, persistence} = this._resolveMedia(id);
        const pendings = [];
        if (cache !== undefined && cache.support.objectArrayNodeAppend) {
            pendings.push(cache.objectArrayNodeAppend(id, path, items));
        }
        if (persistence !== undefined && persistence.support.objectArrayNodeAppend) {
            pendings.push(persistence.objectArrayNodeAppend(id, path, items));
        }
        assert(pendings.length != 0, 'can not use objectArrayNodeAppend by any of media');
        await Promise.all(pendings);
    }

    async objectArrayNodeUnshift(id, path, items) {
        const {cache, persistence} = this._resolveMedia(id);
        const pendings = [];
        if (cache !== undefined && cache.support.objectArrayNodeUnshift) {
            pendings.push(cache.objectArrayNodeUnshift(id, path, items));
        }
        if (persistence !== undefined && persistence.support.objectArrayNodeUnshift) {
            pendings.push(persistence.objectArrayNodeUnshift(id, path, items));
        }
        assert(pendings.length != 0, 'can not use objectArrayNodeUnshift by any of media');
        await Promise.all(pendings);
    }

    async objectArrayNodeInsert(id, path, index, item) {
        const {cache, persistence} = this._resolveMedia(id);
        const pendings = [];
        if (cache !== undefined && cache.support.objectArrayNodeInsert) {
            pendings.push(cache.objectArrayNodeInsert(id, path, index, item));
        }
        if (persistence !== undefined && persistence.support.objectArrayNodeInsert) {
            pendings.push(persistence.objectArrayNodeInsert(id, path, index, item));
        }
        assert(pendings.length != 0, 'can not use objectArrayNodeInsert by any of media');
        await Promise.all(pendings);
    }

    async objectArrayNodeDel(id, path, index) {
        const {cache, persistence} = this._resolveMedia(id);
        const pendings = [];
        if (cache !== undefined && cache.support.objectArrayNodeDel) {
            pendings.push(cache.objectArrayNodeDel(id, path, index));
        }
        if (persistence !== undefined && persistence.support.objectArrayNodeDel) {
            pendings.push(persistence.objectArrayNodeDel(id, path, index));
        }
        assert(pendings.length != 0, 'can not use objectArrayNodeDel by any of media');
        await Promise.all(pendings);
    }

    async objectArrayNodePop(id, path) {
        const {cache, persistence} = this._resolveMedia(id);
        let value = undefined;
        if (cache !== undefined && cache.support.objectArrayNodePop) {
            value = await cache.objectArrayNodePop(id, path);
        }

        if (value !== undefined) {
            return value;
        }

        if (persistence !== undefined && persistence.support.objectArrayNodePop) {
            value = await persistence.objectArrayNodePop(id, path);
            return value;
        }
        
        throw new Error('can not use objectArrayNodePop by any of media');
    }

    async objectArrayNodeShift(id, path) {
        const {cache, persistence} = this._resolveMedia(id);
        let value = undefined;
        if (cache !== undefined && cache.support.objectArrayNodeShift) {
            value = await cache.objectArrayNodeShift(id, path);
        }

        if (value !== undefined) {
            return value;
        }

        if (persistence !== undefined && persistence.support.objectArrayNodeShift) {
            value = await persistence.objectArrayNodeShift(id, path);
            return value;
        }
        
        throw new Error('can not use objectArrayNodeShift by any of media');
    }

    async find({where, sort, limit}) {
        const {indexes} = require('../../global');
        let rows = [];
        if (this._cache !== undefined) {
            assert((this._cache.shards.length <= 1) || (sort == undefined && limit == undefined), `can not use sort or limit when shards more than one`);
            let hadFind = false;
            for (let shard of this._cache.shards) {
                let backend = Backend.create(shard, indexes[this._moduleName]);
                if (backend.support.find == false) break;
                Array.prototype.push.apply(rows, await backend.find({where, sort, limit}));
                hadFind = true;
            }
            if (hadFind) return rows;
        }

        if (this._persistence !== undefined) {
            assert((this._persistence.shards.length <= 1) || (sort == undefined && limit == undefined), `can not use sort or limit when shards more than one`);
            let hadFind = false;
            for (let shard of this._persistence.shards) {
                let backend = Backend.create(shard, indexes[this._moduleName]);
                if (backend.support.find == false) break;
                Array.prototype.push.apply(rows, await backend.find({where, sort, limit}));
                hadFind = true;
            }
            if (hadFind) return rows;
        }

        throw new Error('can not use find by any of media');
    }
}