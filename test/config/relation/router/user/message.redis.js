module.exports = {
    cache: {
        shards: [
            {
                media: "redis",
                host: "127.0.0.1",
                port: 6379,
                bucket: "db_orm.r_user_message",
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    }
};