const assert = require('assert');
const uuid = require('uuid');
const ORM = require('../');
ORM.setup({
	objectPath: `${__dirname}/config/object`,
    relationPath: `${__dirname}/config/relation`,
    removeSchemaUndefinedProperties: false
});
const ObjectUser = new ORM.Object('user');
const ObjectMessage = new ORM.Object('message');
const RelationUserMessage = new ORM.Relation('user.message');

const {Users, Messages, UserMessages} = require('./data');

describe('#basic', function () {
    after(async function() {
        await Promise.all([
            RelationUserMessage.clear(UserMessages[0].subject),
            RelationUserMessage.clear(UserMessages[1].subject),
            ObjectUser.del(Users[0].id),
            ObjectUser.del(Users[1].id),
            ObjectUser.del(Users[2].id),
            ObjectMessage.del(Messages[0].id),
            ObjectMessage.del(Messages[1].id)
        ])
    });

    it('[object-set]', async function() {
        await ObjectUser.set(Users[0]);
        assert(await ObjectUser.has(Users[0].id), `object set failed`);
    });

    it('[object-has]', async function() {
        await ObjectUser.set(Users[0]);
        assert(await ObjectUser.has(Users[0].id) === true, 'user id should exists');
        assert(await ObjectMessage.has(100) === false, 'message id should not exists');
    });

    it('[object-get]', async function() {
        await ObjectUser.set(Users[0]);
        assert((await ObjectUser.get(Users[0].id)).id == Users[0].id, `object get failed`);
    });

    it('[object-del]', async function() {
        await ObjectUser.set(Users[0]);
        await ObjectUser.del(Users[0].id);
        assert(!await ObjectUser.has(Users[0].id), `object del failed`);
    });

    it('[object-array-append]', async function() {
        await ObjectUser.set(Users[0]);
        let friend1 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        let friend2 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        let friend3 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        await ObjectUser.arrayNodeAppend(Users[0].id, '.friends', friend1);
        await ObjectUser.arrayNodeAppend(Users[0].id, '.friends', friend2, friend3);
        let {friends: [{fid: friend1Id}, {fid: friend2Id}, {fid: friend3Id}]} = await ObjectUser.get(Users[0].id);
        assert(friend1Id == friend1.fid && friend2Id == friend2.fid && friend3Id == friend3.fid, `object array append failed`);
    });

    it('[object-array-unshift]', async function() {
        await ObjectUser.set(Users[0]);
        let friend1 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        let friend2 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        let friend3 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        await ObjectUser.arrayNodeUnshift(Users[0].id, '.friends', friend1);
        await ObjectUser.arrayNodeUnshift(Users[0].id, '.friends', friend2, friend3);
        let {friends: [{fid: friend1Id}, {fid: friend2Id}, {fid: friend3Id}]} = await ObjectUser.get(Users[0].id);
        assert(friend1Id == friend3.fid && friend2Id == friend2.fid && friend3Id == friend1.fid, `object array unshift failed`);
    });

    it('[object-array-insert]', async function() {
        await ObjectUser.set(Users[0]);
        let friend1 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        let friend2 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        let friend3 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        await ObjectUser.arrayNodeAppend(Users[0].id, '.friends', friend1, friend3);
        await ObjectUser.arrayNodeInsert(Users[0].id, '.friends', 1, friend2);
        let {friends: [{fid: friend1Id}, {fid: friend2Id}, {fid: friend3Id}]} = await ObjectUser.get(Users[0].id);
        assert(friend2Id == friend2.fid, `object array insert failed`);
    });

    it('[object-array-del]', async function() {
        await ObjectUser.set(Users[0]);
        let friend1 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        let friend2 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        let friend3 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        await ObjectUser.arrayNodeAppend(Users[0].id, '.friends', friend1, friend2, friend3);
        await ObjectUser.arrayNodeDel(Users[0].id, '.friends', 1);
        let {friends: [{fid: friend1Id}, {fid: friend3Id}]} = await ObjectUser.get(Users[0].id);
        assert(friend1Id == friend1.fid && friend3Id == friend3.fid , `object array del failed`);
    });

    it('[object-array-pop]', async function() {
        await ObjectUser.set(Users[0]);
        let friend1 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        let friend2 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        await ObjectUser.arrayNodeAppend(Users[0].id, '.friends', friend1, friend2);
        let {fid: friend2Id} = await ObjectUser.arrayNodePop(Users[0].id, '.friends');
        assert(friend2Id == friend2.fid && (await ObjectUser.get(Users[0].id)).friends.length == 1, `object array pop failed`);
    });

    it('[object-array-shift]', async function() {
        await ObjectUser.set(Users[0]);
        let friend1 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        let friend2 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
        await ObjectUser.arrayNodeAppend(Users[0].id, '.friends', friend1, friend2);
        let {fid: friend1Id} = await ObjectUser.arrayNodeShift(Users[0].id, '.friends');
        assert(friend1Id == friend1.fid && (await ObjectUser.get(Users[0].id)).friends.length == 1, `object array shift failed`);
    });

    it('[object-find-where]', async function() {
        await Promise.all([
            ObjectUser.set(Users[0]), 
            ObjectUser.set(Users[1]), 
            ObjectUser.set(Users[2])
        ]);
        assert((await ObjectUser.find()).length == 3, `object find where [.find()] failed`);
        let result = await ObjectUser.find({where: ORM.Logic.whereOperator('.id', '=', Users[0].id)});
        assert(result.length == 1 && result[0].id == Users[0].id, `object find where [.find(id where operator =)] failed`);

        result = await ObjectUser.find({where: ORM.Logic.whereOperator('.name', '=', Users[0].name)});
        assert(result.length == 1 && result[0].id == Users[0].id, `object find where [.find(name where operator =)] failed`);

        result = await ObjectUser.find({where: ORM.Logic.whereNot(ORM.Logic.whereOperator('.name', '=',  Users[0].name))});
        assert(result.length == 2 && [Users[2].id, Users[1].id].includes(result[0].id) && [Users[2].id, Users[1].id].includes(result[1].id), `object find where [.find(where not)] failed`);
        
        result = await ObjectUser.find({where: ORM.Logic.whereIn('.name', Users[0].name, Users[1].name)});
        assert(result.length == 2 && [Users[0].id, Users[1].id].includes(result[0].id) && [Users[0].id, Users[1].id].includes(result[1].id), `object find where [.find(where in)] failed`);
        
        result = await ObjectUser.find({where: ORM.Logic.whereAnd(
            ORM.Logic.whereOperator('.name', '=', Users[0].name),
            ORM.Logic.whereOperator('.id', '=', Users[0].id)
        )});
        assert(result.length == 1 && result[0].id == Users[0].id, `object find where [.find(id where and)] failed`);

        result = await ObjectUser.find({where: ORM.Logic.whereOr(
            ORM.Logic.whereOperator('.name', '=', Users[0].name),
            ORM.Logic.whereOperator('.name', '=', Users[1].name)
        )});
        assert(result.length == 2 && [Users[0].id, Users[1].id].includes(result[0].id) && [Users[0].id, Users[1].id].includes(result[1].id), `object find where [.find(where or)] failed`);

        result = await ObjectUser.find({where: ORM.Logic.whereLike('.name', `%${Users[0].name.substr(1, 3)}%`)});
        assert(result.length == 1 && result[0].id == Users[0].id, `object find where [.find(id where like)] failed`);

        result = await ObjectUser.find({where: ORM.Logic.whereBetween('.money', 1, 111)});
        assert(result.length == 1 && result[0].id == Users[0].id, `object find where [.find(id where between)] failed`);
    });

    it('[object-find-sort]', async function() {
        await Promise.all([
            ObjectUser.set(Users[0]), 
            ObjectUser.set(Users[1]), 
            ObjectUser.set(Users[2])
        ]);
        let [{id: user3Id}, {id: user2Id}, {id: user1Id}] = await ObjectUser.find({sort: ORM.Logic.sort('.id', "desc")});
        assert(user1Id == Users[0].id && user2Id == Users[1].id && user3Id == Users[2].id, `object find sort failed`);
    });

    it('[object-find-skip-limit]', async function() {
        await Promise.all([
            ObjectUser.set(Users[0]), 
            ObjectUser.set(Users[1]), 
            ObjectUser.set(Users[2])
        ]);
        let result = await ObjectUser.find({limit: ORM.Logic.limit(1), sort: ORM.Logic.sort('.id')});
        assert(result.length == 1 && result[0].id == Users[0].id, `object find limit failed`);

        result = await ObjectUser.find({limit: ORM.Logic.limit(1, 1), sort: ORM.Logic.sort('.id')});
        assert(result.length == 1 && result[0].id == Users[1].id, `object find limit skip failed`);
    });

    it('[relation-put]', async function() {
        await RelationUserMessage.put(UserMessages[0]);
        assert(await RelationUserMessage.fetch(UserMessages[0].subject, UserMessages[0].object) != undefined, `relation put failed`);
    });

    it('[relation-has]', async function() {
        await RelationUserMessage.put(UserMessages[0]);
        assert(await RelationUserMessage.has(Users[0].id, Messages[0].id) === true, 'relation has failed');
        assert(await RelationUserMessage.has(Users[1].id, Messages[1].id) === false, 'relation has failed');
    });

    it('[relation-fetch]', async function() {
        await RelationUserMessage.put(UserMessages[0]);
        assert((await RelationUserMessage.fetch(Users[0].id, Messages[0].id)).readTime === UserMessages[0].readTime, 'relation fetch failed');
    });

    it('[relation-remove]', async function() {
        await RelationUserMessage.put(UserMessages[0]);
        await RelationUserMessage.put(UserMessages[1]);
        await RelationUserMessage.remove(Users[0].id, Messages[0].id);
        assert(await RelationUserMessage.fetch(Users[0].id, Messages[0].id) == undefined, 'relation remove failed');
    });

    it('[relation-count]', async function() {
        await RelationUserMessage.put(UserMessages[0]);
        await RelationUserMessage.put(UserMessages[1]);
        assert(await RelationUserMessage.count(Users[0].id) === 2, 'relation count failed');
    });

    it('[relation-list]', async function() {
        await RelationUserMessage.put(UserMessages[0]);
        await RelationUserMessage.put(UserMessages[1]);
        let result = await RelationUserMessage.list(Users[0].id);
        assert(result.length == 2, 'relation list failed');

        result = await RelationUserMessage.list(Users[0].id, ORM.Logic.sort('.status', "DESC"));
        assert(result.length == 2 && result[0].status == UserMessages[1].status && result[1].status == UserMessages[0].status, 'relation list sort failed');

        result = await RelationUserMessage.list(Users[0].id, ORM.Logic.sort('.status', "DESC"), ORM.Logic.limit(1));
        assert(result.length == 1 && result[0].status == UserMessages[1].status, 'relation list sort limit failed');

        result = await RelationUserMessage.list(Users[0].id, ORM.Logic.sort('.status', "DESC"), ORM.Logic.limit(1, 1));
        assert(result.length == 1 && result[0].status == UserMessages[0].status, 'relation list sort limit skip failed');
    })

    it('[relation-clear', async function() {
        await RelationUserMessage.put(UserMessages[0]);
        await RelationUserMessage.put(UserMessages[1]);
        await RelationUserMessage.clear(Users[0].id);
        assert(await RelationUserMessage.count(Users[0].id) == 0, 'relation clear fail');
    });
});
