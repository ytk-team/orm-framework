module.exports = class {
    constructor(connParam, indexes) {
        this._connParam = connParam;
        this._indexes = indexes;
        this._support = {
            find: false,
            objectArrayNodeAppend: false,
            objectArrayNodeUnshift: false,
            objectArrayNodeInsert: false,
            objectArrayNodeDel: false,
            objectArrayNodePop: false,
            objectArrayNodeShift: false
        }
    }

    get support() {
        return this._support;
    }

    static get media() {
        throw new Error('media name must be set by subclass');
    }

    async objectGet(id) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async objectSet(id, value) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async objectDel(id) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async objectHas(id) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async objectArrayNodeAppend(id, path, items) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async objectArrayNodeUnshift(id, path, items) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async objectArrayNodeInsert(id, path, index, item) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async objectArrayNodeDel(id, path, index) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async objectArrayNodePop(id, path) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async objectArrayNodeShift(id, path) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async find(where = undefined, sort = undefined, limit = undefined) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async relationFetch(subject, object) {
        throw new Error('this method is supposed to be implemented by subclass');
    }
     
    async relationPut(relation) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async relationRemove(subject, object) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async relationHas(subject, object) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async relationList(subject, sort = undefined, limit = undefined) {
        throw new Error('this method is supposed to be implemented by subclass');
    }
     
    async relationCount(subject) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async relationClear(subject) {
        throw new Error('this method is supposed to be implemented by subclass');
    }
}
