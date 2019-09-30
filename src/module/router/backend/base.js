module.exports = class {
    constructor(connParam, indexes) {
        this._connParam = connParam;
        this._indexes = indexes;
    }

    get support() {
        return {
            objectFind: false,
            objectCount: false,
            objectArrayNodeAppend: false,
            objectArrayNodeUnshift: false,
            objectArrayNodeInsert: false,
            objectArrayNodeDel: false,
            objectArrayNodePop: false,
            objectArrayNodeShift: false
        }
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

    async objectFind(where = undefined, sort = undefined, limit = undefined) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async objectCount(where = undefined) {
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

    async relationList(subject, sort = undefined, limit = undefined, filter = undefined) {
        throw new Error('this method is supposed to be implemented by subclass');
    }
     
    async relationCount(subject,filter) {
        throw new Error('this method is supposed to be implemented by subclass');
    }

    async relationClear(subject) {
        throw new Error('this method is supposed to be implemented by subclass');
    }
}
