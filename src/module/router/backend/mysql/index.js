const Pool = require('./pool');
const assert = require('assert');
const Mysql = require('mysql');
const uuid = require('uuid').v4;
const Base = require('../base.js');
const mutex = require('process-key-mutex');
const {whereEq, whereNq, whereGe, whereGt, whereLe, whereLt, whereAnd, Type} = require('../../../logic');


module.exports = class extends Base {
    constructor(connParam, indexes) {
        super(connParam, indexes);
        this._mutex = mutex;
    }

    get support() {
        return {
            objectFind: true,
            objectCount: true,
            objectArrayNodeAppend: true,
            objectArrayNodeUnshift: true,
            objectArrayNodeInsert: true,
            objectArrayNodeDel: true,
            objectArrayNodePop: true,
            objectArrayNodeShift: true
        }
    }

    static get media() {
        return 'mysql';
    }

    async objectGet(id) {
        let sql = Mysql.format('SELECT doc FROM ?? WHERE ?? = ?', [this._connParam.table, '_id', id]);
        let [row] = await this._execute(sql);
        if (row === undefined) return undefined;
        row = JSON.parse(row.doc);
        delete row._id;
        return row;
    }

    //原来使用REPLACE INTO,若是全新数据插入情况，Promise.all有可能造成死锁
    async objectSet(id, value) {
        // const sql = Mysql.format('REPLACE INTO ?? SET ?? = ?', [this._connParam.table, 'doc', JSON.stringify(Object.assign({_id: id}, value))]);
        // await this._execute(sql);
        let sql = Mysql.format('SELECT count(_id) as count FROM ?? WHERE ?? = ?', [this._connParam.table, '_id', id]);
        let [{count}] = await this._execute(sql);
        if (count === 0) {
            sql = Mysql.format('INSERT INTO ?? SET ?? = ?', [this._connParam.table, 'doc', JSON.stringify(Object.assign({_id: id}, value))]);
        }
        else {
            sql = Mysql.format('UPDATE ?? SET ?? = ? WHERE ?? = ?', [
                this._connParam.table, 
                'doc', 
                JSON.stringify(Object.assign({_id: id}, value)),
                '_id',
                id
            ]);
        }
        await this._execute(sql);
    }

    async objectDel(id) {
        const sql = Mysql.format('DELETE FROM ?? WHERE ?? = ?', [this._connParam.table, '_id', id]);
        await this._execute(sql);
    }

    async objectHas(id) {
        let sql = Mysql.format('SELECT count(_id) as count FROM ?? WHERE ?? = ?', [this._connParam.table, '_id', id]);
        let [{count}] = await this._execute(sql);
        return count !== 0;
    }

    async relationPut(relation) {
        return this.objectSet(`${relation.subject}_${relation.object}`, relation);
    }

    async relationFetch(subject, object) {
        return this.objectGet(`${subject}_${object}`);
    }

    async relationHas(subject, object) {
        return this.objectHas(`${subject}_${object}`);
    }

    async relationRemove(subject, object) {
        return this.objectDel(`${subject}_${object}`);
    }

    async relationList(subject, sort = undefined, limit = undefined, filter = undefined) {
        return this.objectFind({
            where: filter === undefined ? whereEq('.subject', subject) : whereAnd(whereEq('.subject', subject), filter),
            sort,
            limit
        });
    }

    async relationCount(subject, filter = undefined) {
        let {query, binds} = this._parseWhereToMysql(
            filter === undefined ? whereEq('.subject', subject) : whereAnd(whereEq('.subject', subject), filter)
        );
        let sql = Mysql.format(`SELECT count(_id) as count FROM ?? WHERE ${query}`, [this._connParam.table]);
        let [{count}] = await this._execute(sql, binds);
        return count;
    }

    async relationClear(subject) {
        let {query, binds} = this._parseWhereToMysql(whereEq('.subject', subject));
        const sql = Mysql.format(`DELETE FROM ?? WHERE ${query}`, [this._connParam.table]);
        await this._execute(sql, binds);
    }

    async objectArrayNodeAppend(id, path, items) {
        let insertItems = items.map(_ => `'$${path}', CAST(${Mysql.format('?', JSON.stringify(_))} AS JSON)`);
        const sql = Mysql.format(`UPDATE ?? SET doc=JSON_ARRAY_APPEND(doc, ${insertItems.join(', ')}) WHERE ?? = ?`, [this._connParam.table, '_id', id]);
        await this._execute(sql);
    }

    async objectArrayNodeUnshift(id, path, items) {
        let insertItems = items.map((item, index, arr) => `'$${path}[${index}]', CAST(${Mysql.format('?', JSON.stringify(arr[arr.length - index - 1]))} AS JSON)`);
        const sql = Mysql.format(`UPDATE ?? SET doc=JSON_ARRAY_INSERT(doc, ${insertItems.join(', ')}) WHERE ?? = ?`, [this._connParam.table, '_id', id]);
        await this._execute(sql);
    }

    async objectArrayNodeInsert(id, path, index, item) {
        const sql = Mysql.format(`UPDATE ?? SET doc=JSON_ARRAY_INSERT(doc, '$${path}[${index}]', CAST(? AS JSON)) WHERE ?? = ?`, [this._connParam.table, JSON.stringify(item), '_id', id]);
        await this._execute(sql);
    }

    async objectArrayNodeDel(id, path, index) {
        const sql = Mysql.format('UPDATE ?? SET doc=JSON_REMOVE(doc, ?) WHERE ?? = ?', [this._connParam.table, `$${path}[${index}]`, '_id', id]);
        await this._execute(sql);
    }

    async objectArrayNodePop(id, path) {
        return this._mutex.lock(`${this._connParam.host}:${this._connParam.port}_${this._connParam.database}:${this._connParam.table}_${id}_${path}`, async() => {
            let sql = Mysql.format('SELECT doc->>? as arr FROM ?? where ?? = ?', [`$${path}`, this._connParam.table, '_id', id]);
            let [row] = await this._execute(sql);
            assert(row != undefined, 'can not find record');
            let arr = JSON.parse(row.arr);
            if (arr === null || arr.length === 0) return undefined;
            sql = Mysql.format('UPDATE ?? SET doc=JSON_REMOVE(doc, ?) WHERE ?? = ?', [this._connParam.table, `$${path}[${arr.length - 1}]`, '_id', id]);
            await this._execute(sql);
            return arr.pop();
        })
    }

    async objectArrayNodeShift(id, path) {
        return this._mutex.lock(`${this._connParam.host}:${this._connParam.port}_${this._connParam.database}:${this._connParam.table}_${id}_${path}`, async() => {
            let sql = Mysql.format('SELECT doc->>? as first FROM ?? where ?? = ?', [`$${path}[0]`, this._connParam.table, '_id', id]);
            let [row] = await this._execute(sql);
            assert(row != undefined, 'can not find record');
            let item = JSON.parse(row.first);
            if (item === null) return undefined;
            sql = Mysql.format('UPDATE ?? SET doc=JSON_REMOVE(doc, ?) WHERE ?? = ?', [this._connParam.table, `$${path}[0]`, '_id', id]);
            await this._execute(sql);
            return item;
        })
    }

    async objectFind({where = undefined, sort = undefined, limit = undefined,group=undefined}) {
        let sql = '';
        let whereSql = '';
        let sortSql = '';
        let groupSql='';
        var binds = {};
        if (where != undefined) {
            var {query, binds} = this._parseWhereToMysql(where);
            whereSql = `WHERE ${query}`;
        }
        if(group != undefined){
            groupSql = `GROUP BY ${[].concat(group).map(_ => this._parseGroupToMysql(_)).join(',')}`;
        }
        if (sort != undefined) {
            sortSql = `ORDER BY ${[].concat(sort).map(_ => this._parseSortToMysql(_)).join(',')}`;
        }
        if (limit != undefined) {
            let subSql = Mysql.format(`SELECT _id FROM ?? ${whereSql} ${groupSql} ${sortSql} ${this._parseLimitToMysql(limit)}`, [this._connParam.table]);
            sql = Mysql.format(`SELECT * FROM ?? JOIN (${subSql}) AS sub using(_id) ${sortSql}`, [this._connParam.table]);
        }
        else {
            sql = Mysql.format(`SELECT doc FROM ?? ${whereSql} ${groupSql} ${sortSql}`, [this._connParam.table]);
        }
        return (await this._execute(sql, binds)).map(_ => {
            let row = JSON.parse(_.doc);
            delete row._id;
            return row;
        });
    }

    async objectCount(where = undefined,group = undefined) {
        let sql = '';
        let whereSql = '';
        let groupSql='';
        var binds = {};
        if (where != undefined) {
            var {query, binds} = this._parseWhereToMysql(where);
            whereSql = `WHERE ${query}`;
        }
        if(group != undefined){
            groupSql = `GROUP BY ${[].concat(group).map(_ => this._parseGroupToMysql(_)).join(',')}`;
            sql = Mysql.format(`SELECT COUNT(COUNT) AS count FROM (SELECT COUNT(_id) as count FROM ?? ${whereSql} ${groupSql}) tmpc `, [this._connParam.table]);
        }else{
            sql = Mysql.format(`SELECT COUNT(_id) as count FROM ?? ${whereSql}`, [this._connParam.table]);
        }
        let [{count}] = await this._execute(sql, binds);
        return count;
    }

    async _execute(sql, params = {}) {
        let mysql = await Pool.fetch(this._connParam);
        return await new Promise((resolve, reject) => {
            mysql.query(sql, params, (error, rows, fields) => {
                mysql.release();
                if (error) {
                    reject(error);
                    return;
                }
                return resolve(rows);
            });
        });
    }

    _parseWhereToMysql(where) {
        let totalBinds = {};
        if (where instanceof Type.WhereAnd) {
            return {
                query: where.items.map(item => {
                    let {query, binds} = this._parseWhereToMysql(item);
                    Object.assign(totalBinds, binds);
                    return `(${query})`;
    
                }).join(' AND '),
                binds: totalBinds
            }
        }
        else if (where instanceof Type.WhereOr) {
            return {
                query: where.items.map(item => {
                    let {query, binds} = this._parseWhereToMysql(item);
                    Object.assign(totalBinds, binds);
                    return `(${query})`;
    
                }).join(' OR '),
                binds: totalBinds
            }
        }
        else if (where instanceof Type.WhereNot) {
            let {query, binds} = this._parseWhereToMysql(where.item);
            Object.assign(totalBinds, binds);
            return {
                query: `(NOT ${query})`,
                binds: totalBinds
            }
        }
        else if (where instanceof Type.WhereIn) {
            let columnName = this._getColumnName(where.field);
            return {
                query: `${columnName} in (${where.items.map(item => {
                    let placeholder = `_${uuid().replace(/\-/g, "")}`;
                    totalBinds[placeholder] = typeof item === "boolean" ? item.toString() : item;
                    return `:${placeholder}`;
                }).join(', ')})`,
                binds: totalBinds
            }
        }
        else if (where instanceof Type.WhereBetween) {
            let columnName = this._getColumnName(where.field);
            let fromPlaceholder = `_${uuid().replace(/\-/g, "")}`;
            totalBinds[fromPlaceholder] = where.from;
            let toPlaceholder = `_${uuid().replace(/\-/g, "")}`;
            totalBinds[toPlaceholder] = where.to;
            return {
                query: `${columnName} BETWEEN :${fromPlaceholder} AND :${toPlaceholder}`,
                binds: totalBinds
            }
        }
        else if (where instanceof Type.WhereLike) {
            let columnName = this._getColumnName(where.field);
            let placeholder = `_${uuid().replace(/\-/g, "")}`;
            totalBinds[placeholder] = where.value;
            return {
                query: `${columnName} LIKE :${placeholder}`,
                binds: totalBinds
            }
        }
        else if (where instanceof Type.WhereEq) {
            let columnName = this._getColumnName(where.field);
            let placeholder = `_${uuid().replace(/\-/g, "")}`;
            totalBinds[placeholder] = typeof where.value === "boolean" ? where.value.toString() : where.value;
            return {
                query: `${columnName} = :${placeholder}`,
                binds: totalBinds
            }
        }
        else if (where instanceof Type.WhereNq) {
            let columnName = this._getColumnName(where.field);
            let placeholder = `_${uuid().replace(/\-/g, "")}`;
            totalBinds[placeholder] = typeof where.value === "boolean" ? where.value.toString() : where.value;
            return {
                query: `${columnName} != :${placeholder}`,
                binds: totalBinds
            }
        }else if (where instanceof Type.WhereGe) {
            let columnName = this._getColumnName(where.field);
            let placeholder = `_${uuid().replace(/\-/g, "")}`;
            totalBinds[placeholder] = where.value;
            return {
                query: `${columnName} >= :${placeholder}`,
                binds: totalBinds
            }
        }else if (where instanceof Type.WhereGt) {
            let columnName = this._getColumnName(where.field);
            let placeholder = `_${uuid().replace(/\-/g, "")}`;
            totalBinds[placeholder] = where.value;
            return {
                query: `${columnName} > :${placeholder}`,
                binds: totalBinds
            }
        }else if (where instanceof Type.WhereLe) {
            let columnName = this._getColumnName(where.field);
            let placeholder = `_${uuid().replace(/\-/g, "")}`;
            totalBinds[placeholder] = where.value;
            return {
                query: `${columnName} <= :${placeholder}`,
                binds: totalBinds
            }
        }else if (where instanceof Type.WhereLt) {
            let columnName = this._getColumnName(where.field);
            let placeholder = `_${uuid().replace(/\-/g, "")}`;
            totalBinds[placeholder] = where.value;
            return {
                query: `${columnName} < :${placeholder}`,
                binds: totalBinds
            }
        }else if (where instanceof Type.WhereContain) {
            let columnName = this._getColumnName(where.field);
            let placeholder = `_${uuid().replace(/\-/g, "")}`;
            totalBinds[placeholder] = where.value;
            return {
                query: `MATCH ${columnName} AGAINST (:${placeholder})`,
                binds: totalBinds
            }
        }else if (where instanceof Type.WhereContainBoolean) {
            let columnName = this._getColumnName(where.field);
            let placeholder = `_${uuid().replace(/\-/g, "")}`;
            totalBinds[placeholder] = where.value;
            return {
                query: `MATCH ${columnName} AGAINST (:${placeholder} IN BOOLEAN MODE)`,
                binds: totalBinds
            }
        }
        else if (where instanceof Type.WhereIsUndef) {
            let columnName = this._getColumnName(where.field);
            return {
                query: `${columnName} IS NULL`,
                binds: totalBinds
            }
        }
        else if (where instanceof Type.WhereIsDef) {
            let columnName = this._getColumnName(where.field);
            return {
                query: `${columnName} IS NOT NULL`,
                binds: totalBinds
            }
        }
    }

    _parseSortToMysql(sort) {
        let columnName = this._getColumnName(sort.field);
        return `${columnName} ${sort.order}`;
    }

    _parseLimitToMysql(limit) {
        return `LIMIT ${limit.skip}, ${limit.limit}`;
    }

    _getColumnName(fieldName) {
        if (this._indexes.findIndex(_ => _ === fieldName) != -1) {
            return `\`${fieldName === ".id" ? "_id" : fieldName}\``;
        }
        else {
            fieldName = fieldName
                .split('.')
                .map(_ => /^[0-9]{1,}/.test(_) ? `\\"${_}\\"` : _) //当存在以数字开头的key时要做下转义
                .join('.');
            return `doc->>"$${fieldName}"`;
        }
    }
    
    async objectFieldFind({field=undefined,where = undefined, sort = undefined, limit = undefined,group=undefined}){
        let sql = '';
        let whereSql = '';
        let sortSql = '';
        let fieldSql = 'doc';
        let groupSql='';
        var binds = {};
        if(field !=undefined){
            fieldSql = ` ${[].concat(field).map(_ => this._parseFieldToMysql(_)).join(',')}`;
        }
        if (where != undefined) {
            var {query, binds} = this._parseWhereToMysql(where);
            whereSql = `WHERE ${query}`;
        }
        if(group != undefined){
            groupSql = `GROUP BY ${[].concat(group).map(_ => this._parseGroupToMysql(_)).join(',')}`;
        }
        if (sort != undefined) {
            sortSql = `ORDER BY ${[].concat(sort).map(_ => this._parseSortToMysql(_)).join(',')}`;
        }
        if (limit != undefined) {
            sql = Mysql.format(`SELECT ${fieldSql} FROM ?? ${whereSql} ${groupSql} ${sortSql} ${this._parseLimitToMysql(limit)}`, [this._connParam.table]);
        }
        else {
            sql = Mysql.format(`SELECT ${fieldSql} FROM ?? ${whereSql} ${groupSql} ${sortSql}`, [this._connParam.table]);
        }
        return (await this._execute(sql, binds)).map(_ => {
            if(_.doc !==undefined){
                _.doc = JSON.parse(_.doc);
            }
            return _;
        });

    }

    _parseGroupToMysql(group){
        let columnName = this._getColumnName(group.field);
        return `${columnName} `;
    }
    _parseFieldToMysql(field){
        let columnName = this._getColumnNameByField(field.field);
        return `${columnName} AS ${field.alias}`;
    }

    _getColumnNameByField(fieldName) {
        if (this._indexes.findIndex(_ => _ === fieldName) != -1) {
            return `\`${fieldName === ".id" ? "_id" : fieldName}\``;
        }
        else if(fieldName.substring(0,1) !='.'){
            return fieldName;
        }
        else {
            fieldName = fieldName
                .split('.')
                .map(_ => /^[0-9]{1,}/.test(_) ? `\\"${_}\\"` : _) //当存在以数字开头的key时要做下转义
                .join('.');
            return `doc->>"$${fieldName}"`;
        }
    }
}
