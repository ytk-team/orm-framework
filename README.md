# qtk-orm-framework

qtk-orm-framework是一个Node版的K-V型数据操作框架，支持一对一，一对多两种关系，存储目前支持**Mysql**、**Redis**两种类型．框架致力于提供一套简单的API去操作K-V结构数据，使用者只需定义一份**数据描述文件**及**数据库配置文件**,框架将会帮你实现**建库建表(Mysql)**、**建索引(Mysql)**、**增删改查**、**数据分表分库**、**数据校验**、**数据缓存**、**数据热迁移**． 
框架有两个核心概念``Object``、``Relation``
- Object: 存储一对一关系的实体，可以将其理解为Document(文档)，数据中必须包含``id``字段，主键为``id``
- Relation: 存储一对多关系的实体，可以将其理解为Collection(容器)，一个容器里面有多个Document(文档)，数据中必须包含``subject``、``object``字段，``subject``为容器id,``object``为文档id,主键为``${subject}_${object}``
## 安装
``` shell
＃in your project
npm install @qtk/orm-framework --save
# install global
npm install @qtk/orm-framework -g
```

## 文档

### 建库建表建索引
``` shell
orm_build_mysql -s <schema path> -r <router path> -t <object or relation> <module name>

# example
orm_build_mysql -s ./test/config/object/schema -r ./test/config/object/router -t object user
orm_build_mysql -s ./test/config/relation/schema -r ./test/config/relation/router -t relation user.message
```
### 删库删表删索引
``` shell
orm_destroy_mysql -r <router path> <module name>

#example
orm_destroy_mysql -r ./test/config/object/router user
orm_destroy_mysql -r ./test/config/relation/router user.message
```
### 清库
``` shell
orm_purge_data -r <router path> <module name>

#example
orm_purge_data -r ./test/config/object/router user
orm_purge_data -r ./test/config/object/router user.message
```

### API
#### 初始化
```js
const ORM = require('@qtk/orm-framework');
ORM.setup({
    objectSchemaPath: `${__dirname}/config/object/schema`,
    objectRouterPath: `${__dirname}/config/object/router`,
    relationSchemaPath: `${__dirname}/config/relation/schema`,
    relationRouterPath: `${__dirname}/config/relation/router`,
    strict: true
});
const ObjectUser = new ORM.Object('user');
const RelationUserMessage = new ORM.Relation('user.message');
```
- objectSchemaPath: object的schema文件夹路径
- objectRouterPath: object的router文件夹路径
- relationSchemaPath: relation的schema文件夹路径
- relationRouterPath: relation的router文件夹路径
- strict: 严格模式，默认``true``.当数据库中的值结构跟schema数据描述不相符时，为``false``时会依照schema描述重新构造拷贝数据后，再进行schema校验．而``true``时则直接进入schema校验，此情况抛数据错误．

#### Object
提供对象操作方法

|方法名|输入|返回|作用|
|--|--|--|--|
|set|(object)|无|添加／更新一条数据,object里必须含有``id``字段|
|get|(id)|object|读取某条记录|
|has|(id)|boolean|查询某条数据是否存在|
|del|(id)|无|删除某条数据|
|arrayNodeAppend|(id, path, ...items)|无|给某条记录下的数组节点尾部添加一个或多个元素|
|arrayNodeUnshift|(id, path, ...items)|无|给某条记录下的数组节点头部添加一个或多个元素|
|arrayNodeInsert|(id, path, item)|无|给某条记录下的数组节点某个索引位置插入一个元素|
|arrayNodeUnshift|(id, path, ...items)|无|给某条记录下的数组节点头部添加一个或多个元素|
|arrayNodeDel|(id, path)|无|删除某条记录下的数组节点里指定位置的元素|
|arrayNodePop|(id, path)|object|弹出某条记录下的数组节点尾部一个元素|
|arrayNodeShift|(id, path)|object|弹出某条记录下的数组节点头部一个元素|
|find|({where?, sort?, limit?})|array|查找所有符合规则的object,支持排序、分页|
|count|(where)|integer|统计所有符合规则的object数量|

#### Relation
提供关系操作方法

|方法名|输入|返回|作用|
|--|--|--|--|
|fetch|(subject, object)|object|返回关系中某个对象|
|put|(relation)|无|将某个对象放入关系中，relation必须包含subject, object两个字段|
|has|(subject, object)|boolean|判断关系中含有某个对象|
|remove|(subject, object)|无|从关系中移除某个对象|
|clear|(subject)|无|清空关系里所有对象|
|list|(subject, sort？, limit？, filter？)|array|返回关系中的对象，可筛选、排序、分页|
|count|(subject, filter？)|integer|统计关系中的对象，可筛选|

#### Logic
提供一套标准的查询、排序、分页语法，在Object``find``、``count``,Relation``list``、``count``中可以使用
```js
const {whereEq, whereNq, whereGt, whereGe, whereLt, whereLe, whereContain, whereIn, whereBetween, whereLike, whereAnd, whereOr, whereNot, sort, limit} = require('@qtk/orm-framework').Logic;
```

|方法|作用|参数|示例(按照属性栏的顺序)|
|--|--|--|--|
|whereEq|等于|(field, value)|whereEq('.a', 1)|
|whereNq|不等于|(field, value)|whereNq('.a', 1)|
|whereGt|大于|(field, value)|whereGt('.a', 1)|
|whereGe|大于等于|(field, value)|whereGe('.a', 1)|
|whereLt|小于|(field, value)|whereLt('.a', 1)|
|whereLe|小于等于|(field, value)|whereLe('.a', 1)|
|whereContain|数组包含|(field, value)|whereContain('.arr[*]', 1)|
|whereIn|枚举|(field, ...values)|whereIn('.a', 1, 2, 3)|
|whereBetween|区段之间|(field, from, to)|whereBetween('.a', 1, 2)|
|whereLike|模糊匹配|(field, value)|whereLike('.a', '%a%')|
|whereAnd|与|(...items)|whereAnd(whereEq('.a', 1), whereLt('.b', 1))|
|whereOr|或|(...items)|whereOr(whereEq('.a', 1), whereLt('.b', 1))|
|whereNot|非|item|whereNot(whereEq('.a', 1))|
|sort|排序|(field, order = "ASC")|sort('.a', 'DESC')|
|limit|分页|(limit, skip = 0)|limit(1,1)|

##### JSON化
Logic对象是一个类对象，不支持通过网络传输。故Logic对象提供``toJson``方法，允许将Logic对象转换为JSON对象．**同时在原本使用Logic对象的地方支持使用JSON化后对象进行操作**
```js
let result = await ObjectUser.find({where: ORM.Logic.whereEq('.id', Users[0].id)});
assert(result.length == 1 && result[0].id == Users[0].id, `object find where [.find(id where operator =)] failed`);

//等同于下面
result = await ObjectUser.find({where: ORM.Logic.whereEq('.id', Users[0].id).toJson()});
assert(result.length == 1 && result[0].id == Users[0].id, `[toJson]object find where [.find(id where operator =)] failed`);
```

#### 例子
``` js
const ORM = require('@qtk/orm-framework');
ORM.setup({
    objectSchemaPath: `${__dirname}/config/object/schema`,
    objectRouterPath: `${__dirname}/config/object/router`,
    relationSchemaPath: `${__dirname}/config/relation/schema`,
    relationRouterPath: `${__dirname}/config/relation/router`,
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
    },
    mayBeNull: 1
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
    readTime: 1516538014,
    mayBeNull: 1
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
console.log(await ObjectUser.find({where: ORM.Logic.whereEq('.id', user.id)}));
console.log(await ObjectUser.find({where: ORM.Logic.whereEq('.name', user.name)}));
console.log(await ObjectUser.find({where: ORM.Logic.whereNot(ORM.Logic.whereEq('.name', user.name))}));
console.log(await ObjectUser.find({where: ORM.Logic.whereIn('.name', user.name, user2.name)}));
console.log(await ObjectUser.find({where: ORM.Logic.whereAnd(
    ORM.Logic.whereEq('.name', user.name),
    ORM.Logic.whereEq('.id', user.id)
)}));
console.log(await ObjectUser.find({where: ORM.Logic.whereOr(
    ORM.Logic.whereEq('.name', user.name),
    ORM.Logic.whereEq('.name', user2.name)
)}));
console.log(await ObjectUser.find({where: ORM.Logic.whereLike('.name', `%${user.name.substr(1, 3)}%`)}));
console.log(await ObjectUser.find({where: ORM.Logic.whereBetween('.money', 1, 111)}));  
console.log(await ObjectUser.find({where: ORM.Logic.whereContain('.friends[*].fid', '0000000000000003')})); 
console.log(await ObjectUser.find({where: ORM.Logic.whereIsNull('.mayBeNull')}));
console.log(await ObjectUser.find({where: ORM.Logic.whereIsNotNull('.mayBeNull')}));
console.log(await ObjectUser.find({sort: ORM.Logic.sort('.id', "desc")}));
console.log(await ObjectUser.find({limit: ORM.Logic.limit(1), sort: ORM.Logic.sort('.id')}));
console.log(await ObjectUser.find({limit: ORM.Logic.limit(1, 1), sort: ORM.Logic.sort('.id', 'DESC')}));
console.log(await ObjectUser.find({limit: ORM.Logic.limit(1, 1), sort: [ORM.Logic.sort('.id', 'DESC'), ORM.Logic.sort('.money', 'ASC')]}));

console.log(await ObjectUser.count());
console.log(await ObjectUser.count(ORM.Logic.whereEq('.id', user.id)));
console.log(await ObjectUser.count(ORM.Logic.whereEq('.name', user.name)}));
console.log(await ObjectUser.count(ORM.Logic.whereNot(ORM.Logic.whereEq('.name', user.name))));
console.log(await ObjectUser.count(ORM.Logic.whereIn('.name', user.name, user2.name)));
console.log(await ObjectUser.count(ORM.Logic.whereAnd(
    ORM.Logic.whereEq('.name', user.name),
    ORM.Logic.whereEq('.id', user.id)
)));
console.log(await ObjectUser.count(ORM.Logic.whereOr(
    ORM.Logic.whereEq('.name', user.name),
    ORM.Logic.whereEq('.name', user2.name)
)));
console.log(await ObjectUser.count(ORM.Logic.whereLike('.name', `%${user.name.substr(1, 3)}%`)));
console.log(await ObjectUser.count(ORM.Logic.whereBetween('.money', 1, 111)}));  
console.log(await ObjectUser.count(ORM.Logic.whereContain('.friends[*].fid', '0000000000000003'))); 
console.log(await ObjectUser.count(ORM.Logic.whereIsNull('.mayBeNull')));
console.log(await ObjectUser.count(ORM.Logic.whereIsNotNull('.mayBeNull')));
console.log(await ObjectUser.count(RM.Logic.sort('.id', "desc")));
console.log(await ObjectUser.count(ORM.Logic.limit(1), sort: ORM.Logic.sort('.id')));
console.log(await ObjectUser.count(ORM.Logic.limit(1, 1), sort: ORM.Logic.sort('.id', 'DESC')));
console.log(await ObjectUser.count(ORM.Logic.limit(1, 1), sort: [ORM.Logic.sort('.id', 'DESC'), ORM.Logic.sort('.money', 'ASC')]));

console.log(await ObjectUser.del(user.id));

await RelationUserMessage.put(userMessage);
console.log(await RelationUserMessage.has(user.id, message.id));
console.log(await RelationUserMessage.fetch(user.id, message.id));
console.log(await RelationUserMessage.count(user.id));
console.log(await RelationUserMessage.count(Users[0].id, ORM.Logic.whereEq('.status', 2)));
console.log(await RelationUserMessage.count(Users[0].id, ORM.Logic.whereIsNull('.mayBeNull')));
console.log(await RelationUserMessage.count(Users[0].id, ORM.Logic.whereIsNotNull('.mayBeNull')));
console.log(await RelationUserMessage.list(user.id, ORM.Logic.sort('.status', 'DESC'), ORM.Logic.limit(1, 1)));
console.log(await RelationUserMessage.list(user.id, [ORM.Logic.sort('.status', 'DESC'), ORM.Logic.sort('.readTime', 'DESC')], ORM.Logic.limit(1, 1)));
console.log(await RelationUserMessage.list(user.id, [ORM.Logic.sort('.status', 'DESC'), ORM.Logic.sort('.readTime', 'DESC')], ORM.Logic.limit(1, 1)), ORM.Logic.whereEq('.status', 2));

console.log(await RelationUserMessage.remove(user.id, message.id));
console.log(await RelationUserMessage.clear(user.id));
```
更详细的操作，请看[测试用例](./test/basic-test.js)[github才能支持]
## Schema定义(数据描述)

- 关键字
  - **id** : object的主键
  - **subject** : relation键之一
  - **object** : relation键之一，relation的主键为 **\${subject}_\${object}**
- 数据类型
  - **string** : 字符串
  - **boolean** : 布尔型
  - **integer** : 整形
  - **number** : 数字
  - **object** : 对象
  - **array** : 数组
  - **empty** : 空对象，值为 **null**

- 方法
    - 通用
        - **desc(value)** : 字段描述
        - **example(value)** : 字段值例子
        - **default(value)** : 字段默认值, **如果字段是必须的，但数据库里的值是``undefined``, 那么object的``get``、``find``,relation的``fetch``, ``list``操作将会在返回数据时候自动给其加上默认值．注意：对于设置了默认值且数据库里值为undefined的字段，在进行排序、查找时，使用的值是数据库里的值，即``undefined``而不是默认值**
        - **enum(value1,value2...)** : 值枚举
    - number/integer
        - **max(value)** : 最大值    
        - **min(value)** : 最小值
        - **exclusiveMin(value)** : 字段值不小于
        - **exclusiveMax(value)** : 字段值不大于
        - **multipleOf(value)** : 字段值是定义值的整数倍
    - array
        - **minItems(value)** : 元素最少个数
        - **maxItems(value)** : 元素最多个数
        - **length(value)** :　元素个数
        - **contains(value)** : 数组必须包含的值
        - **uniqueItems()** : 每个元素必须唯一，支持对象元素(比较每个对象的key && value是否相同)
        - **item(value/array)** : 定义数组里每个元素的结构
    - string
        - **maxLength(value)** : 最大长度
        - **minLength(value)** : 最小长度
        - **length(value)** : 长度
        - **pattern(value)** : 字符串必须匹配的正则
    - object
        - **properties(object)** : 定义对象的结构
        - **patternProperties(object)** : 使用正则来定义对象的结构
        - **additionalProperties(boolean)** : 是否允许实例拥有非[properties]里定义的节点         
        - **require(value1, value2...)** : 实例必须拥有[properties]里定义的节点
        - **requireAll()** : [properties]里定义的节点全是必须的
        - **if...then...elseIf...else...endIf** : 根据实例不同的情况可以拥有不同的``properties``、``patternProperties``、``require``、``requireAll``定义
    - string/number/integer
        - **index()** : 给对应的Key加索引．目前支持``string``、``integer``、``number``、``array里的元素``类型，对于非数组元素里的``string``类型，必须设置``length``或者``maxLength``. **由于``Object``keyword的``id``,``Relation``keyword的``subject``与``object``默认设置了索引，故当其为``string``类型时，必须设置长度**．而对于数组元素里的``string``类型则不用设置长度，因为采用的是全文索引

- 语法糖

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
    id: string().length(16), //如果id是字符串类型, 那么必须设置length或者maxLength
    name: string(),
    gender: integer().enum(0, 1).index(),
    money: number().min(0),
    null: empty(),
    location: {
        lng: string().length(6).index(), //对象里某个节点做索引
        lat: string().desc('lat').default("2")
    },
    isVip: boolean(),
    friends: array().item({
        fid: string().pattern(/^[A-Za-z0-9]{1,}$/).index(), //可以针对数组里每个元素的某个值做索引
        time: integer()
    }),
    record: array(string().index()), //可以针对数组里每个元素做索引
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
    subject: string().length(32), //string类型必须设置长度
    object: integer(), //若是string类型也应设置长度
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

## Router定义(数据库配置)
```
user.js　//当前使用的数据库路由文件
user.deprecated.js　//废弃的数据库路由文件
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

路由的文件名跟schema定义的文件名一一对应，路由文件有两种状态：``当前``(xxx.js)及``废弃``(xxx.deprecated.js).框架主力使用``当前``路由配置，万一同级目录下存在同名废弃路由的话，使用过程中会对数据进行热迁移．
每份路由可配置``persistence``、``cache``节点，每个节点下配置分片信息``shards``及分片规则``hash``．persistence顾名思义就持久化存储，目前框架内置支持mysql,而cache内置支持redis.
``shards``: 数组，每个元素表示一个分片信息
``hash``:　哈希函数，输入参数是``id``.在对某条数据进行操作时，框架将给哈希函数传入数据的id(Object是``id``字段，Relation是``subject``字段)，函数根据id映射到``shards``某个分片上
若``persistence``、``cache``同时配置的话，那么读操作会优先操作``cache``(除了Object``find``、``count``,Relation``list``、``count``)，若有数据则立即返回，若无则会继续查询``persistence``，若有数据，在返回数据同时也同步一份到``cache``中．写操作则是等待两边操作完毕后才返回

具体热迁移逻辑如下：

|模式|方法|处理逻辑|
|--|--|--|
|Object|get|优先查当前，若无则查废弃，有结果则同步该数据到当前|
|Object|set|只写当前|
|Object|has|同Object.get|
|Object|del|当前、废弃同时删除|
|Object|arrayNodeAppend|首先Object.has检查，其顺带数据迁移，之后只写当前|
|Object|arrayNodeUnshift|首先Object.has检查，其顺带数据迁移，之后只写当前|
|Object|arrayNodeInsert|首先Object.has检查，其顺带数据迁移，之后只写当前|
|Object|arrayNodeDel|首先Object.has检查，其顺带数据迁移，之后只写当前|
|Object|arrayNodePop|首先Object.has检查，其顺带数据迁移，之后只写当前|
|Object|arrayNodeShift|首先Object.has检查，其顺带数据迁移，之后只写当前|
|Object|find|优先查当前，若无则查废弃，有结果则返回但**不做同步**|
|Object|count|同Object.find|
|Relation|fetch|同Object.get|
|Relation|put|同Object.set|
|Relation|has|同Object.has|
|Relation|remove|同Object.del|
|Relation|clear|同Object.del|
|Relation|list|同Object.find|



## 注意(坑)
- schema定义文件若给字段设置默认值, 那么该字段也应是必须的，否则不会自动补上默认值
- schema定义文件若给字段设置默认值且数据库里该字段值为undefined时，在进行排序、查找操作时，使用的值是数据库里的值，即``undefined``而不是默认值
- Object``find``、``count``,Relation``list``,``count``考虑到可能会涉及多条数据情况，为了不影响性能，故上述方法不支持数据热迁移
- 当Router里配置``cache``与``persistence``时，即开启数据缓存功能(加速读)，此情况存在有些数据还未加载到``cache``情况，故Object``find``、``count``、Relation``list``、``count``将会直接读取``persistence``来保证数据的准确性
- Object``find``提供的是Object搜索功能，若Router里存在多个``shards``时，即开启数据分片功能，由于无法根据id定位到具体的分片，故会查询所有的分片信息，并合并结果返回．在此种情况下无法进行分页排序，故不支持``sort``与``limit``．
- 使用whereContain时，其实现原理是全文搜索，故需要保证**字段内容长度 >=ft_min_word_len ,数据库默认ft_min_word_len为4**

## 自定义存储介质
框架内部支持mysql与redis两种存储介质，若想换一种存储媒介或者重新设计底层数据结构的话，那么可以继承框架的``BackendMedia``基类，实现指定的函数功能后，以插件的形式注册到框架上．那么即可无痛更换，而不用修改任何代码．
### 构造函数
负责初始化存储媒介的链接．构造函数有两个参数：

``connParam``: 经过哈希函数计算得到的分片信息

``indexes``: 该``Object``／``Relation``的字段索引列表
```js
constructor(connParam, indexes) {
    super(connParam, indexes);
}
```

connParam值例子：
```js
{
    "media":"mysql",
    "host":"localhost",
    "port":3306,
    "user":"root",
    "password":"",
    "database":"db_orm",
    "table":"o_user"
}
```

indexes值例子：
```js
[
    '.id', 
    '.gender', 
    '.location.lng', //对象里某个字段索引
    '.extraNumber',
    '.arr[*]', //数组索引
    '.friends[*].fid'　//数组索引
]
```

### 插件名
实现静态``media``,返回值与路由文件里``shards``里配置的``media``字符值相同
```js
static get media() { //set media name
    return 'redis';
}
```

### 方法
|方法|入参|有结果返回|无结果返回|必须实现|作用|
|--|--|--|--|--|--|
|objectGet|(id)|object|undefined|是|获取对象记录|
|objectSet|(id, value)|无|无|是|添加／更新对象记录|
|objectHas|(id)|true|false|是|查询对象记录是否存在|
|objectDel|(id)|无|无|是|删除对象记录|
|objectArrayNodeAppend|(id, path, items)|无|无|否|给某条记录下的数组节点尾部添加一个或多个元素|
|objectArrayNodeUnshift|(id, path, items)|无|无|否|给某条记录下的数组节点尾部添加一个或多个元素|
|objectArrayNodeInsert|(id, path, index, item)|无|无|否|给某条记录下的数组节点某个索引位置插入一个元素|
|objectArrayNodeUnshift|(id, path, items)|object|undefined|否|给某条记录下的数组节点头部添加一个或多个元素|
|objectArrayNodeDel|(id, path, index)|无|无|否|删除某条记录下的数组节点里指定位置的元素|
|objectArrayNodePop|(id, path)|object|undefined|否|弹出某条记录下的数组节点尾部一个元素|
|objectArrayNodeShift|(id, path)|object|undefined|否|弹出某条记录下的数组节点头部一个元素|
|objectArrayNodeShift|(id, path)|object|undefined|否|弹出某条记录下的数组节点头部一个元素|
|objectFind|({where, sort, limit})|array|[]|否|查找所有符合规则的对象,支持排序、分页|
|objectCount|(where)|integer|0|否|统计所有符合规则的对象数量|
|relationFetch|(subject, object)|object|undefined|是|返回关系中某个对象|
|relationPut|(relation)|无|无|是|将某个对象放入关系中|
|relationRemove|(subject, object)|无|无|是|从关系中移除某个对象|
|relationHas|(subject, object)|true|false|是|判断关系中含有某个对象|
|relationList|(subject, sort？, limit？, filter？)|array|[]|是|返回关系中的对象，可筛选、排序、分页|
|relationCount|(subject, filter？)|integer|0|是|统计关系中的对象，可筛选|
|relationClear|(subject)|无|无|是|清空关系里所有对象|


### 支持的高级数据操作配置
媒介可以不实现上一小节某些数据高级操作功能，此时必须在介质配置里时关闭该功能支持，否则框架调用该函数会导致报错．**默认都不支持**

```js
get support() {
    return {
        objectFind: false,
        objectCount: false,
        objectArrayNodeAppend: false,
        objectArrayNodeUnshift: false,
        objectArrayNodeInsert: false,
        objectArrayNodeDel: false,
        objectArrayNodePop: false,
        objectArrayNodeShift: false
    }
}
```

### 解析Logic
逻辑分``where``,``sort``,``limit``三类，``objectFind``,``objectCount``,``relationList``, ``relationCount``函数传入的是标准逻辑对象,需要开发者自行转化成对应媒介数据的操作逻辑．所有标准逻辑对象都在``ORM.Logic.Type``定义

|标准对象|属性|示例(按照属性栏的顺序)|
|--|--|--|
|WhereAnd|items|标准逻辑对象数组|
|WhereOr|items|标准逻辑对象数组|
|WhereNot|item|标准逻辑对象|
|WhereIn|field, items|'.a', [1, 2, 3]|
|WhereBetween|field, from, to|'.a', 1, 2|
|WhereLike|field, value|'.a', '%a%'|
|WhereEq|field, value|'.a', 1|
|WhereNq|field, value|'.a', 1|
|WhereGt|field, value|'.a', 1|
|WhereGe|field, value|'.a', 1|
|WhereLt|field, value|'.a', 1|
|WhereLe|field, value|'.a', 1|
|WhereIsNull|field|'.a'|
|WhereIsNotNull|fieldlue|'.a'|
|WhereContain|field, value|'.arr[*]', 1|
|Sort|field, order|'.a', 'DESC'|
|Limit|limit, skip|1,1|


### Redis媒介插件代码
请移步[这里](./doc/DEMO_PLUGIN.md)[github才能支持]

## 更新日志
- 2019-06-08: Logic对象支持转换为json对象。同时在原使用Logic对象的地方支持直接传入json对象进行查询
- 2019-09-30: 
    - 重写数据默认值填充器
    - 更新数据校验器为[qtk-validator](https://www.npmjs.com/package/@qtk/schema-validator),提示更加友好
    - core部分代码整理，优化执行速度
    - 去除数据取操作时做数据校验
    - bug修复
    - 增加orm_rebuild_column_index重建表列/索引命令
- 2020-04-26:
    - Logic增加`WhereIsNull`,`WhereIsNotNull`
    
## 致谢
schema语法引用的是[semantic-schema](https://www.npmjs.com/package/semantic-schema)项目代码，感谢Magnus同学的支持