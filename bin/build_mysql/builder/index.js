const Mysql = require('mysql');
const assert = require('assert');
const Index = require('../../../src/module/index');
const Sugar = require('../../../src/module/sugar');
module.exports = class {
    constructor(type, schemaDir, routerDir, moduleName) {
        this._type = type;
        this._router = require(`${routerDir}/${moduleName.replace(/\./g, '/')}.js`);
        this._schema = Sugar.resolve(require(`${schemaDir}/${moduleName.replace(/\./g, '/')}.js`)).normalize();
        this._shards = this._router.persistence ? this._router.persistence.shards : [];
        this._moduleName = moduleName;
    }

    async exec() {
        for (let shard of this._shards) {
            if (shard.media !== 'mysql') continue;
            await this._createDatabase(shard);
            await this._createTable(shard);
            await this._createColumn(shard);
            await this._createIndex(shard);
        }
    }

    async _createDatabase(shard) {
        await this._query(shard, `CREATE DATABASE IF NOT EXISTS ${shard.database}`);
    }

    async _createTable(shard) {
        let sql = "";
        if (this._type == "object") {
            let indexes = Index.analysis(this._schema, ['.id']);
            let idInfo = indexes.find(({path}) => path == '.id');
            assert(idInfo != undefined, `module ${this._moduleName} primaryKey type can not translate to mysql key definition`);
            let primaryKeyLength = idInfo.length;
            let primaryKeyType = `VARCHAR(${primaryKeyLength})`;
            assert(primaryKeyLength <= Math.floor(767 / 4), `key length is no longer than ${Math.floor(767 / 4)}`); 
            sql = `CREATE TABLE IF NOT EXISTS ${shard.database}.${shard.table}
                (
                    doc json NULL,
                    \`_id\` ${primaryKeyType} BINARY as (json_unquote(json_extract(\`doc\`,'$._id'))) stored primary key
                )
                ENGINE=InnoDB CHARSET=utf8mb4
                ;`
        }
        else {
            let indexes = Index.analysis(this._schema, ['.subject', '.object']);
            let subjectInfo = indexes.find(({path}) => path == '.subject');
            let objectInfo = indexes.find(({path}) => path == '.object');
            assert(subjectInfo != undefined && objectInfo != undefined, `module ${this._moduleName} primaryKey type can not translate to mysql key definition`);
            let primaryKeyLength = subjectInfo.length + objectInfo.length + 1;//＋１是因为加多了一个连接符
            let primaryKeyType = `VARCHAR(${primaryKeyLength})`;
            assert(primaryKeyLength <= Math.floor(767 / 4), `key length is no longer than ${Math.floor(767 / 4)}`); 
            sql = `CREATE TABLE IF NOT EXISTS ${shard.database}.${shard.table}
                (
                    doc json NULL,
                    \`_id\` ${primaryKeyType} BINARY as (json_unquote(json_extract(\`doc\`,'$._id'))) stored primary key
                )
                ENGINE=InnoDB CHARSET=utf8mb4
                ;`
        }
        await this._query(shard, sql);
    }

    async _createColumn(shard, ) {
        let indexes = Index.analysis(this._schema, this._type == "relation" ? ".subject" : []);
        for (let {path, type, indexType, length} of indexes) {
            if (await this._query(shard, `SELECT * FROM information_schema.columns WHERE table_schema = '${shard.database}' AND table_name = '${shard.table}' AND column_name = '${path}'`) != undefined) continue;
            let sql = undefined;
            if (indexType == "NORMAL") {
                let mysqlDefinition = "";
                switch(type) {
                    case "string":
                        mysqlDefinition = `VARCHAR(${length})`;
                        break;
                    case "integer":
                        mysqlDefinition = `BIGINT`;
                        break;
                    case "number":
                        mysqlDefinition = `FLOAT`;
                        break;
                    default:
                        throw new Error(`can not support index type ${type}`);
                }
                sql = `ALTER TABLE \`${shard.database}\`.\`${shard.table}\` ADD \`${path}\` ${mysqlDefinition} generated always as (doc->>'$${path}')`;
            }
            else if (indexType == "FULL_TEXT") {
                sql = `ALTER TABLE \`${shard.database}\`.\`${shard.table}\` ADD \`${path}\` TEXT GENERATED ALWAYS as (doc->>"$${path}") STORED`;
            }
            else {
                throw new Error(`no support indexType ${indexType}`);
            }
            await this._query(shard, sql);
        }
    }

    async _createIndex(shard) {
        let indexes = Index.analysis(this._schema, this._type == "relation" ? ".subject" : []);
        for (let {path, indexType} of indexes) {
            if (await this._query(shard, `SELECT * FROM information_schema.statistics WHERE table_schema = '${shard.database}' AND table_name = '${shard.table}' AND index_name = '${path}'`) != undefined) continue;
            let sql = undefined;
            if (indexType == "NORMAL") {
                sql = `CREATE INDEX \`${path}\` ON ${shard.database}.${shard.table} (\`${path}\`)`;
            }
            else if (indexType == "FULL_TEXT") {
                sql = `CREATE FULLTEXT INDEX \`${path}\` ON ${shard.database}.${shard.table} (\`${path}\`)`;
            }
            else {
                throw new Error(`no support indexType ${indexType}`);
            }
            await this._query(shard, sql);
        }
    }

    async _query(shard, sql) {
        const connection = Mysql.createConnection({
            host : shard.host,
            port : shard.port,
            user : shard.user,
            password : shard.password,
        });
    
        return new Promise((resolve, reject) => {
            connection.connect();
            connection.query(sql, (err, rows) => {
                connection.end();
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows[0]);
            });
        });
    }
}