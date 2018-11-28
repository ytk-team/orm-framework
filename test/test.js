const assert = require('assert');
const uuid = require('uuid');
const times = 1;
const ORM = require('../');
ORM.setup({
	objectPath: `${__dirname}/config/object`,
    relationPath: `${__dirname}/config/relation`,
    removeSchemaUndefinedProperties: false
});
const ObjectUser = new ORM.Object('usertest');
const ObjectMessage = new ORM.Object('message');
const RelationUserMessage = new ORM.Relation('user.messagetest');

const {Users, Messages, UserMessages} = require('./data');

describe('#time', function () {

    it('test', async function() {
        this.timeout(100000000);
        var time = process.uptime();
        for (let i = 0; i < times; i++) {
            let result = await ObjectUser.find({
                //where: ORM.Logic.whereOperator('.money', '=', 74),
                where: ORM.Logic.whereOperator('.extraNumber', '=', 49),
                limit: ORM.Logic.limit(1000)
            });
            console.log(result.length)
        }
        console.log(`object-set: ${(process.uptime() - time) * 1000 / times} ms`);
    });

});
