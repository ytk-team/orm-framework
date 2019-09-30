module.exports = {
    cache: {
        shards: [
            {
                media: "redis",
                host: "127.0.0.1",
                port: 6379,
                bucket: "db_orm.o_auto_fix",
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    }
};