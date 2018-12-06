# qtk-orm-framework

qtk-orm-framework is an orm database framework, support mysql and redis. This framework aim at providing a single and simple api to describe/operate with k-v type data in both cache and relationship databases. Developer what need to do is just write a data structure schema, and router (means the configuration of database server), and then the framework will help you to build mysql table, create/read/update/delete/transfer data simplify.

## Installation

    # in your project
    npm install @qtk/orm-framework --save
    # install global
    npm install @qtk/orm-framework -g

## Usage

- ### Bin
  - #### Create Table
    ``` shell
    orm_build_mysql -d <definition path> -t <object or relation> <module name>

    # example
    orm_build_mysql -d ./example/object -t object user
    orm_build_mysql -d ./example/relation -t relation user.message
    ```
  - #### Drop Table
    ``` shell
    orm_destroy_mysql -d <definition path> <module name>

    #example
    orm_destroy_mysql -d ./example/object user
    orm_destroy_mysql -d ./example/relation user.message
    ```
  - #### Truncate Table
    ``` shell
    orm_purge_data -d <definition path> <module name>

    #example
    orm_purge_data -d ./example/object user
    orm_purge_data -d ./example/relation user.message
    ```

- ### API
  - #### Object
    - has(id)
    - get(id)
    - set(object)
    - del(id)
    - arrayNodeAppend(id, path, ...items)
    - arrayNodeUnshift(id, path, ...items)
    - arrayNodeInsert(id, path, index, item)
    - arrayNodeDel(id, path, index)
    - arrayNodePop(id, path)
    - arrayNodeShift(id, path)
    - find(params)
  - #### Relation
    - fetch(subject, object)
    - has(subject, object)
    - put(relation)
    - remove(subject, object)
    - clear(subject)
    - count(subject)
    - list(subject, sort = undefined, limit = undefined)


``` js
const ORM = require('@qtk/orm-framework');
ORM.setup({
    objectPath: `${__dirname}/config/object`,
    relationPath: `${__dirname}/config/relation`,
    removeSchemaUndefinedProperties: false // if value has schema undefined properties,whether or not to remove them for passing the schema check when get/fetch/list
});
const ObjectUser = new ORM.Object('user');
const ObjectMessage = new ORM.Object('message');
const RelationUserMessage = new ORM.Relation('user.message');

const user = {
    id: '0000000000000001',
    name: 'Cindy',
    gender: 0,
    money: 110,
    null: null,
    location: {
        lng: '113.46',
        lat: '22.27'
    },
    isVip: false,
    friends: [],
    extraObject: {
        count: 1
    }
}
const user2 = {
    id: '0000000000000002',
    name: 'Jessica',
    gender: 0,
    money: 120,
    null: null,
    location: {
        lng: '122.67',
        lat: '23.45'
    },
    isVip: true,
    friends: [{
        fid: '0000000000000003',
        time: 1516538014
    }],
    extraArray: ["1","2","3"],
    extraInteger: 0
}
const message = {
    id: 1,
    title: "hello",
    content: "hey",
    sendTime: 1516538014
}
const userMessage = {
    subject: '0000000000000001',
    object: 1,
    status: 1,
    readTime: 1516538014
}
const friend1 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};
const friend2 = {fid: uuid().replace(/-/g, ""), time: parseInt(Math.random() * 100)};

await ObjectUser.set(user);
await ObjectUser.set(user2);
await ObjectMessage.set(message);
console.log(await ObjectUser.has(user.id));
console.log(await ObjectUser.get(user.id));

await ObjectUser.arrayNodeAppend(user.id, '.friends', friend1, friend2);
await ObjectUser.arrayNodeUnshift(user.id, '.friends', friend1, friend2);
await ObjectUser.arrayNodeInsert(user.id, '.friends', 1, friend2);
await ObjectUser.arrayNodeDel(user.id, '.friends', 1);
console.log(await ObjectUser.arrayNodePop(user.id, '.friends'));
console.log(await ObjectUser.arrayNodeShift(user.id, '.friends'));

console.log(await ObjectUser.find());
console.log(await ObjectUser.find({where: ORM.Logic.whereOperator('.id', '=', user.id)}));
console.log(await ObjectUser.find({where: ORM.Logic.whereOperator('.name', '=', user.name)}));
console.log(await ObjectUser.find({where: ORM.Logic.whereNot(ORM.Logic.whereOperator('.name', '=',  user.name))}));
console.log(await ObjectUser.find({where: ORM.Logic.whereIn('.name', user.name, user2.name)}));
console.log(await ObjectUser.find({where: ORM.Logic.whereAnd(
    ORM.Logic.whereOperator('.name', '=', user.name),
    ORM.Logic.whereOperator('.id', '=', user.id)
)}));
console.log(await ObjectUser.find({where: ORM.Logic.whereOr(
    ORM.Logic.whereOperator('.name', '=', user.name),
    ORM.Logic.whereOperator('.name', '=', user2.name)
)}));
console.log(await ObjectUser.find({where: ORM.Logic.whereLike('.name', `%${user.name.substr(1, 3)}%`)}));
console.log(await ObjectUser.find({where: ORM.Logic.whereBetween('.money', 1, 111)}));  

console.log(await ObjectUser.find({sort: ORM.Logic.sort('.id', "desc")}));
console.log(await ObjectUser.find({limit: ORM.Logic.limit(1), sort: ORM.Logic.sort('.id')}));
console.log(await ObjectUser.find({limit: ORM.Logic.limit(1, 1), sort: ORM.Logic.sort('.id', 'DESC')}));

await RelationUserMessage.put(userMessage);
console.log(await RelationUserMessage.has(user.id, message.id));
console.log(await RelationUserMessage.fetch(user.id, message.id));
console.log(await RelationUserMessage.count(user.id));
console.log(await RelationUserMessage.list(user.id, '.readTime', ORM.Logic.sort('.status', 'DESC'), ORM.Logic.limit(0, 1)));

console.log(await RelationUserMessage.remove(user.id, message.id));
console.log(await RelationUserMessage.clear(user.id));
console.log(await ObjectUser.del(user.id));
console.log(await ObjectMessage.del(message.id));
```

## Schema Definition

- Keyword
  - **id** : special key for object
  - **subject** : special key for relation
  - **object** : special key for relation
  - **string** : type for value
  - **boolean** : type for value
  - **integer** : type for value
  - **number** : type for value
  - **object** : type for value
  - **array** : type for value
  - **empty** : type for value

- Method
    - **desc(value)** : describe the field
    - **example(value)** : give a example for the field
    - **default(value)** : give a default value for the field, **if the field be required and target value is undefined, it will use default value to replace it when use get/fetch/list method**
    - **enum(value1,value2...)** : target string/boolean/number/integer value must in enum
    - **max(value)** : target integer/number maximum limit    
    - **min(value)** : target integer/number minimum limit
    - **max(value)** : target integer/number maximum limit
    - **exclusiveMin(value)** : target integer/number target value must bigger than value
    - **exclusiveMax(value)** : target integer/number target value must less than value
    - **multipleOf(value)** : target integer/number target value must multiple of value
    - **minItems(value)** : target array minimum items limit
    - **maxItems(value)** : target array maximum items limit
    - **length(value)** : target array items length limit
    - **contains(value)** : target array must has designated item
    - **uniqueItems(value)** : target array must be a unique array
    - **item(value/array)** : target array item must match the rule
    - **maxLength(value)** : target string minimum length limit
    - **minLength(value)** : target string maximum length limit
    - **length(value)** : target string length limit
    - **pattern(value)** : target string must match the regex
    - **properties(object)** : describe target object properties
    - **patternProperties(object)** : use regex to describe target object properties
    - **additionalProperties(boolean)** : target object can has other properties besides [properties] description          
    - **require(value1, value2...)** : target object must has special properties
    - **requireAll()** : target object must has all of [properties] description
    - **length(value)** : string length limit
    - **pattern(value)** : string must match the regex
    - **if...then...elseIf...else...endIf** : target object can has different properties/patternProperties/require in different properties/patternProperties situation
    - **index()** : set index for the field, only keyword **``string``, ``integer``, ``number``** can support index, and if keyword ``string``, you must set the ``length`` or ``maxLength`` for the field. **tip: the object ``id``, the relation ``subject``, ``${subject}_${object}`` is be set index by default. so object ``id``, relation ``subject``, ``object`` must set length or maxLength if type is ``string``** 

- Sugar

| sugar          | equivalent                                   |
| -------------- | -------------------------------------------- |
| 1              | integer().enum(1)                            |
| 1.1            | number().enum(1.1)                           |
| 'foo'          | string().enum('foo')                         |
| /^foo\|bar$/   | string().pattern(/^foo\|bar$/)               |
| true           | boolean().enum(true)                         |
| null           | NULL() or empty()                            |
| {foo: 1}       | object().properties({foo: 1}).requiredAll().additionalProperties(false)  |
| [1, 2, 3]      | integer().enum(1, 2, 3)                      |
| [1.1, 2.2, 3]  | number().enum(1.1, 2.2, 3)                   |
| ['foo', 'bar'] | string().enum('foo', 'bar')                  |
| [true, false]  | boolean().enum(true, false)                  |

```javascript
module.exports = {
    id: string().length(16), //if id is string, must set the length or maxlength
    name: string(),
    gender: integer().enum(0, 1).index(),
    money: number().min(0),
    null: empty(),
    location: {
        lng: string().length(6).index(), //index the object field also be supported
        lat: string().desc('lat').default("2")
    },
    isVip: boolean(),
    friends: array().item({
        fid: string().pattern(/^[A-Za-z0-9]{1,}$/),
        time: integer()
    }),
    extraObject: object({
        count: integer()
    }).default({count: 10}),
    extraArray: array(string()).default(['default array']),
    extraInteger: integer().default(0),
    extraNumber: number().default(0.9).index(),
    extraBoolean: boolean().default(false),
    extraString: string().default("default").index().maxLength(32)
};
```

```javascript
module.exports = object({
    subject: string().length(32),
    object: integer(),
    status: integer().enum(0, 1, 2).desc('0:未读; 1:已读; 2:已删'),
    readTime: integer().default(0),
    deletedTime: integer().default(0)
})
    .if.properties({status: 1})
    .then.require('subject', 'object', 'status', 'readTime').additionalProperties(false)
    .elseIf.properties({status: 2})
    .then.require('subject', 'object', 'status', 'deletedTime').additionalProperties(false)
    .else
    .require('subject', 'object', 'status').additionalProperties(false)
    .endIf
```

## Router Definition

Router file has two type, currently and deprecated. current definition describe the new storage server, while the deprecated show the old server. when deprecated one is exist, the framework to will get from the new at first, if get nothing, then will check for the old server, and, copy to the new one. They lie in the same folder, such as

```
user.deprecated.js
user.js
```
```javascript
module.exports = {
    persistence: {
        shards: [
            {
                media: "mysql",
                host: "localhost",
                port: 3306,
                user: "root",
                password: "",
                database: "db_test_game",
                table: "o_user",
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    },
    cache: {
        shards: [
            {
                media: "redis",
                host: "localhost",
                port: 6379,
                bucket: 'o_user_'
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    }
};
```

## Custom Media
orm is support mysql and redis default, if you want to add new media, first extend ``ORM.BaseMedia`` class , and implement function, then use ``ORM.registryMedia`` to registry into orm.
#### must be implemented 
- ``objectGet(id)``
- ``objectSet(id, value)``
- ``objectDel(id)``
- ``objectHas(id)``
- ``relationFetch(subject, object)``
- ``relationPut(relation)``
- ``relationRemove(subject, object)``
- ``relationHas(subject, object)``
- ``relationList(subject, sort = undefined, limit = undefined)``
- ``relationCount(subject)``
- ``relationClear(subject)``
#### not need to implement if disable it
you can disable it in construct, and if the function be called, will throw a error.
```js
    this._support = {
        find: false,
        objectArrayNodeAppend: false,
        objectArrayNodeUnshift: false,
        objectArrayNodeInsert: false,
        objectArrayNodeDel: false,
        objectArrayNodePop: false,
        objectArrayNodeShift: false
    }
```
- ``objectArrayNodeAppend(id, path, items)``
- ``objectArrayNodeUnshift(id, path, items)``
- ``objectArrayNodeInsert(id, path, index, item)``
- ``objectArrayNodeDel(id, path, index)``
- ``objectArrayNodePop(id, path)``
- ``objectArrayNodeShift(id, path)``
- ``find(where = undefined, sort = undefined, limit = undefined)``

### Redis Media Demo
#### Plugin Code
constructor has two params, 
- ``connParam`` is one of schema router definition ``shards`` depends on schema router definition ``hash`` by id.
- ``indexes`` is a array , field paths which be set index. for example:
```js
[
    '.id', 
    '.gender', 
    '.location.lng', 
    '.extraNumber'
]
```
set media name, which match schema router definition shards ``media``
```js
static get media() { //set media name
    return 'redis';
}
```
all the code
```js
const Pool = require('./pool');
module.exports = class extends ORM.BackendMedia {
    constructor(connParam, indexes) {
        super(connParam, indexes);
        this._support = {
            find: false,
            objectArrayNodeAppend: true,
            objectArrayNodeUnshift: true,
            objectArrayNodeInsert: true,
            objectArrayNodeDel: true,
            objectArrayNodePop: true,
            objectArrayNodeShift: true
        }
        this._mutex = require('process-key-mutex');
    }

    static get media() { //set media name
        return 'redis';
    }

    async objectGet(id) {
        let result = await this._execute('get', `${this._connParam.bucket}.${id}`);
        return result == null ? undefined : JSON.parse(result);
    }

    async objectSet(id, value) {
        await this._execute('set', `${this._connParam.bucket}.${id}`, JSON.stringify(value));
    }

    async objectDel(id) {
        await this._execute('del', `${this._connParam.bucket}.${id}`);
    }

    async objectHas(id) {
        return Boolean(await this._execute('exists', `${this._connParam.bucket}.${id}`));
    }

    async objectArrayNodeAppend(id, path, items) {
        await this._mutex(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            this._getNode(value, path).push(...items);
            await this.objectSet(id, value);
        });
    }

    async objectArrayNodeUnshift(id, path, items) {
        await this._mutex(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            let array = this._getNode(value, path)
            items.forEach(item => array.unshift(item));
            await this.objectSet(id, value);
        });
    }

    async objectArrayNodeInsert(id, path, index, item) {
        await this._mutex(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            this._getNode(value, path).splice(index, 0, item);
            await this.objectSet(id, value);
        });
    }

    async objectArrayNodeDel(id, path, index) {
        await this._mutex(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            this._getNode(value, path).splice(index, 1);
            await this.objectSet(id, value);
        });
    }

    async objectArrayNodePop(id, path) {
        return await this._mutex(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            let item = this._getNode(value, path).pop();
            await this.objectSet(id, value);
            return item;
        });
    }

    async objectArrayNodeShift(id, path) {
        return await this._mutex(`${this._connParam.bucket}.${id}`, async() => {
            let value = await this.objectGet(id);
            let item = this._getNode(value, path).shift();
            await this.objectSet(id, value);
            return item;
        });
    }

    async relationFetch(subject, object) {
        let result = await this._execute('hget', `${this._connParam.bucket}.${subject}`, object);
        return result == null ? undefined : JSON.parse(result);
    }

    async relationPut(relation) {
        await this._execute('hset', `${this._connParam.bucket}.${relation.subject}`, relation.object, JSON.stringify(relation));
    }

    async relationHas(subject, object) {
        return Boolean(await this._execute('hexists', `${this._connParam.bucket}.${subject}`, object));
    }

    async relationRemove(subject, object) {
        await this._execute('hdel', `${this._connParam.bucket}.${subject}`, object);
    }

    async relationList(subject, sort = undefined, limit = undefined) {
        let list = (await this._execute('hvals', `${this._connParam.bucket}.${subject}`)).map(_ => JSON.parse(_));
        if (sort != undefined) {
            let {field, order} = sort;
            list.sort((l, r) => order == "ASC" ? this._getNode(l, field) - this._getNode(r, field) : this._getNode(r, field) - this._getNode(l, field));
        }
        if (limit != undefined) {
            list = list.slice(limit.skip, limit.skip + limit.limit);
        }
        return list;
    }

    async relationCount(subject) {
        return await this._execute('hlen', `${this._connParam.bucket}.${subject}`);
    }

    async relationClear(subject) {
        await this._execute('del', `${this._connParam.bucket}.${subject}`);
    }

    async _execute(method, ...params) {
        let redis = Pool.fetch(this._connParam);
        return new Promise((resolve, reject) => {
            redis[method](...params, (error, result) => {
                if (error != undefined) return reject(error);
                return resolve(result);
            })
        })
    }

    _getNode(object, path) {
        return path.split('.').slice(1).reduce((prev, curr) => {
            if (curr == '') return prev;
            if (/\[(\d+)\]/.test(curr)) {
                return object[parseInt(curr.match(/\[(\d+)\]/)[1])];
            }
            else {
                return object[curr];
            }
        }, object);
    }
};
```

#### Orm Definition Router Code
```js
module.exports = {
    cache: {
        shards: [
            {
                media: "redis",
                host: "127.0.0.1",
                port: 6379,
                bucket: "db_orm.o_message",
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    }
};
```
#### Used
```js
const ORM = require('@qtk/orm-framework');
ORM.setup({
	objectPath: `${__dirname}/config/object`,
    relationPath: `${__dirname}/config/relation`,
    removeSchemaUndefinedProperties: false
});
ORM.registryMedia(require('./index.js')); //custom media plugin file path
const ObjectUser = new ORM.Object('user');
await ObjectMessage.set(message);
```

## Acknowledge
schema definition grammar is base in part on the source code of the [semantic-schema](https://www.npmjs.com/package/semantic-schema) project


objectFind,objectCount,relationList,relationCount暂不支持热迁移及，会影响性能
自动填充数据在数据查询之后，故禁止对自动填充字段做object的find(除limit),count,arrayNodeAppend，arrayNodeUnshift,arrayNodeInsert,arrayNodeDel,arrayNodePop,arrayNodeShift;relation的list(除limit),count