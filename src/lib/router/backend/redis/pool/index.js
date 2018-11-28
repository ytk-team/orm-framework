const redis = require('redis');
const cache = new Map();

module.exports = class {
    static fetch(connParam) {
        const key = `${connParam.host}:${connParam.port}`;
        if (!cache.has(key)) {
            cache.set(key, 
                redis.createClient({
                    host: connParam.host,
                    port: connParam.port,
                    retry_strategy: ()=>{
                        console.error(`redis disconnect`);
                        return 200;
                    }
                })
            );
        }

        return cache.get(key);
    }
}