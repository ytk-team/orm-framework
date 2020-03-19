module.exports = {
    persistence: {
        shards: [
            {
                media: "mysql",
                host: "localhost",
                port: 3306,
                user: "root",
                password: "",
                database: "db_orm",
                table: "o_auto_fix",
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    }
};