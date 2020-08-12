const mysql = require('mysql');
const cache = new Map();

module.exports = class {
    static fetch(connParam) {
        const key = `${connParam.user}@${connParam.host}:${connParam.port}/${connParam.database}`;
        if (!cache.has(key)) {
            cache.set(key, mysql.createPool({
                host: connParam.host,
                port: connParam.port,
                user: connParam.user,
                password: connParam.password,
                database: connParam.database,
                charset: 'utf8mb4'
            }));
        }

        const pool = cache.get(key);
        return new Promise((resolve, reject) => {
            pool.getConnection(function (err, connection) {
                if (err !== null) {
                    reject(err);
                    return;
                }
                connection.config.queryFormat = function (query, values) {
                    if (!values) return query;
                    return query.replace(/\:(\w+)/g, function (txt, key) {
                        if (values.hasOwnProperty(key)) {
                            return this.escape(values[key]);
                        }
                        return txt;
                    }.bind(this));
                };
                resolve(connection);
            });
        });
    }
}