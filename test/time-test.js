const assert = require('assert');
const uuid = require('uuid');
const times = 100;
const ORM = require('../');
ORM.setup({
    objectSchemaPath: `${__dirname}/config/object/schema`,
    objectRouterPath: `${__dirname}/config/object/router`,
    relationSchemaPath: `${__dirname}/config/relation/schema`,
    relationRouterPath: `${__dirname}/config/relation/router`,
    removeSchemaUndefinedProperties: false
});
const ObjectUser = new ORM.Object('user');
const ObjectMessage = new ORM.Object('message');
const RelationUserMessage = new ORM.Relation('user.message');

const {Users, Messages, UserMessages} = require('./data');

describe('#time', function () {
    after(async function() {
        this.timeout(100000000);
        var time = process.uptime();
        await Promise.all([
            RelationUserMessage.clear(UserMessages[0].subject),
            RelationUserMessage.clear(UserMessages[1].subject),
            ObjectUser.del(Users[0].id),
            ObjectUser.del(Users[1].id),
            ObjectUser.del(Users[2].id),
            ObjectMessage.del(Messages[0].id),
            ObjectMessage.del(Messages[1].id)
        ])
        console.log(`clear data: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[object-set]', async function() {
        this.timeout(100000000);
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.set(Users[0]);
        }
        console.log(`object-set: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[object-has]', async function() {
        this.timeout(100000000);
        await ObjectUser.set(Users[0]);
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.has(Users[0].id);
        }
        console.log(`object-has: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[object-get]', async function() {
        this.timeout(100000000);
        await ObjectUser.set(Users[0]);
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.get(Users[0].id);
        }
        console.log(`object-get: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[object-del]', async function() {
        this.timeout(100000000);
        await ObjectUser.set(Users[0]);
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.del(Users[0].id);
        }
        console.log(`object-del: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[object-array-append]', async function() {
        this.timeout(100000000);
        await ObjectUser.set(Users[0]);
        let friend1 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.arrayNodeAppend(Users[0].id, '.friends', friend1);
        }
        console.log(`object-array-append: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[object-array-unshift]', async function() {
        this.timeout(100000000);
        await ObjectUser.set(Users[0]);
        let friend1 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.arrayNodeUnshift(Users[0].id, '.friends', friend1);
        }
        console.log(`object-array-unshift: ${(process.uptime() - time) * 1000 / times} ms`);

    });

    it('[object-array-insert]', async function() {
        this.timeout(100000000);
        await ObjectUser.set(Users[0]);
        let friend1 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.arrayNodeInsert(Users[0].id, '.friends', 0, friend1);
        }
        console.log(`object-array-insert: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[object-array-del]', async function() {
        this.timeout(100000000);
        await ObjectUser.set(Users[0]);
        for (let i = 0; i < times; i++) {
            let friend1 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
            await ObjectUser.arrayNodeAppend(Users[0].id, '.friends', friend1);
        }

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.arrayNodeDel(Users[0].id, '.friends', 0);
        }
        console.log(`object-array-del: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[object-array-pop]', async function() {
        this.timeout(100000000);
        await ObjectUser.set(Users[0]);
        for (let i = 0; i < times; i++) {
            let friend1 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
            await ObjectUser.arrayNodeAppend(Users[0].id, '.friends', friend1);
        }

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.arrayNodePop(Users[0].id, '.friends');
        }
        console.log(`object-array-pop: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[object-array-shift]', async function() {
        this.timeout(100000000);
        await ObjectUser.set(Users[0]);
        for (let i = 0; i < times; i++) {
            let friend1 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
            await ObjectUser.arrayNodeAppend(Users[0].id, '.friends', friend1);
        }

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.arrayNodeShift(Users[0].id, '.friends');
        }
        console.log(`object-array-shift: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[object-count-where]', async function() {
        this.timeout(100000000);
        await Promise.all([
            ObjectUser.set(Users[0]), 
            ObjectUser.set(Users[1]), 
            ObjectUser.set(Users[2])
        ]);
        
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.count();
        }
        console.log(`object-count: ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.count(ORM.Logic.whereEq('.id', Users[0].id));
        }
        console.log(`object-count-where(operator id): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.count(ORM.Logic.whereEq('.name', Users[0].name));
        }
        console.log(`object-count-where(operator name): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.count(ORM.Logic.whereNot(ORM.Logic.whereEq('.name', Users[0].name)));
        }
        console.log(`object-count-where(not): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.count(ORM.Logic.whereIn('.name', Users[0].name, Users[1].name));
        }
        console.log(`object-count-where(in): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.count(ORM.Logic.whereAnd(
                ORM.Logic.whereEq('.name', Users[0].name),
                ORM.Logic.whereEq('.id', Users[0].id)
            ));
        }
        console.log(`object-count-where(and): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.count(ORM.Logic.whereOr(
                ORM.Logic.whereEq('.name',  Users[0].name),
                ORM.Logic.whereEq('.name', Users[1].name)
            ));
        }
        console.log(`object-count-where(or): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.count(ORM.Logic.whereLike('.name', `%${Users[0].name.substr(1, 3)}%`));
        }
        console.log(`object-count-where(like): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            result = await ObjectUser.count(ORM.Logic.whereBetween('.money', 1, 111));
        }
        console.log(`object-count-where(between): ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[object-find-where]', async function() {
        this.timeout(100000000);
        await Promise.all([
            ObjectUser.set(Users[0]), 
            ObjectUser.set(Users[1]), 
            ObjectUser.set(Users[2])
        ]);
        
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.find();
        }
        console.log(`object-find-where-find(): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.find({where: ORM.Logic.whereEq('.id', Users[0].id)});
        }
        console.log(`object-find-where-find(operator id): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.find({where: ORM.Logic.whereEq('.name', Users[0].name)});
        }
        console.log(`object-find-where-find(operator name): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.find({where: ORM.Logic.whereNot(ORM.Logic.whereEq('.name', Users[0].name))});
        }
        console.log(`object-find-where-find(not): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.find({where: ORM.Logic.whereIn('.name', Users[0].name, Users[1].name)});
        }
        console.log(`object-find-where-find(in): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.find({where: ORM.Logic.whereAnd(
                ORM.Logic.whereEq('.name', Users[0].name),
                ORM.Logic.whereEq('.id', Users[0].id)
            )});
        }
        console.log(`object-find-where-find(and): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.find({where: ORM.Logic.whereOr(
                ORM.Logic.whereEq('.name',  Users[0].name),
                ORM.Logic.whereEq('.name', Users[1].name)
            )});
        }
        console.log(`object-find-where-find(or): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.find({where: ORM.Logic.whereLike('.name', `%${Users[0].name.substr(1, 3)}%`)});
        }
        console.log(`object-find-where-find(like): ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            result = await ObjectUser.find({where: ORM.Logic.whereBetween('.money', 1, 111)});
        }
        console.log(`object-find-where-find(between): ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[object-find-sort]', async function() {
        this.timeout(100000000);
        await Promise.all([
            ObjectUser.set(Users[0]), 
            ObjectUser.set(Users[1]), 
            ObjectUser.set(Users[2])
        ]);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.find({sort: ORM.Logic.sort('.id', "desc")});
        }
        console.log(`object-find-sort: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[object-find-skip-limit]', async function() {
        this.timeout(100000000);
        await Promise.all([
            ObjectUser.set(Users[0]), 
            ObjectUser.set(Users[1]), 
            ObjectUser.set(Users[2])
        ]);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.find({limit: ORM.Logic.limit(1), sort: ORM.Logic.sort('.id')});
        }
        console.log(`object-find-limit: ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await ObjectUser.find({limit: ORM.Logic.limit(1, 1), sort: ORM.Logic.sort('.id')});
        }
        console.log(`object-find-skip-limit: ${(process.uptime() - time) * 1000 / times} ms`);

    });

    it('[relation-put]', async function() {
        this.timeout(100000000);
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await RelationUserMessage.put(UserMessages[0]);
        }
        console.log(`relation-put: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[relation-has]', async function() {
        this.timeout(100000000);
        await RelationUserMessage.put(UserMessages[0]);
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await RelationUserMessage.has(Users[0].id, Messages[0].id);
        }
        console.log(`relation-has: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[relation-fetch]', async function() {
        this.timeout(100000000);
        await RelationUserMessage.put(UserMessages[0]);
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await RelationUserMessage.fetch(Users[0].id, Messages[0].id);
        }
        console.log(`relation-fetch: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[relation-remove]', async function() {
        this.timeout(100000000);
        for (let i = 0; i < times; i++) {
            await RelationUserMessage.put(Object.assign({} , UserMessages[0], {object: i}));
        }

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await RelationUserMessage.remove(Users[0].id, i);
        }
        console.log(`relation-remove: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[relation-count]', async function() {
        this.timeout(100000000);
        await RelationUserMessage.put(UserMessages[0]);
        await RelationUserMessage.put(UserMessages[1]);
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await RelationUserMessage.count(Users[0].id);
        }
        console.log(`relation-count: ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await RelationUserMessage.count(Users[0].id, ORM.Logic.whereEq('.status', 2));
        }
        console.log(`relation-filter-count: ${(process.uptime() - time) * 1000 / times} ms`);
    });

    it('[relation-list]', async function() {
        this.timeout(100000000);
        await RelationUserMessage.put(UserMessages[0]);
        await RelationUserMessage.put(UserMessages[1]);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await RelationUserMessage.list(Users[0].id);
        }
        console.log(`relation-list: ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await RelationUserMessage.list(Users[0].id, undefined, undefined, ORM.Logic.whereEq('.status', 2));
        }
        console.log(`relation-list-filter: ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await RelationUserMessage.list(Users[0].id, ORM.Logic.sort('.status', "DESC"));
        }
        console.log(`relation-list-sort: ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await RelationUserMessage.list(Users[0].id, ORM.Logic.sort('.status', "DESC"), ORM.Logic.limit(1));
        }
        console.log(`relation-list-sort-limit: ${(process.uptime() - time) * 1000 / times} ms`);

        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await RelationUserMessage.list(Users[0].id, ORM.Logic.sort('.status', "DESC"), ORM.Logic.limit(1, 1));
        }
        console.log(`relation-list-sort-limit-skip: ${(process.uptime() - time) * 1000 / times} ms`);
    })

    it('[relation-clear', async function() {
        await RelationUserMessage.put(UserMessages[0]);
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            await RelationUserMessage.clear(Users[0].id);
        }
        console.log(`relation-clear: ${(process.uptime() - time) * 1000 / times} ms`);
    });
});
