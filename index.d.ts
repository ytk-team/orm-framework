declare namespace ORM {
    /**
     * 对象
     */
    class Object {
        /**
         * 对象
         * @param {string} objectName 对象名
         */
        constructor(objectName: string);

        /**
         * 获取对象
         * @param {string} id objectId
         */
        get(id: string): Promise<any>
    
        /**
         * 新增/更新对象
         * @param {object} data 对象内容
         */
        set(data: any): Promise<void>
    
        /**
         * 删除对象
         * @param {string} id 对象id
         */
        del(id: string): Promise<void>

        /**
         * 判断对象是否存在
         * @param {string} id 对象id
         */
        has(id: string): Promise<boolean>
    
        /**
         * 往对象里的数组类型节点尾部添加元素
         * @param {string} id 对象id
         * @param {string} path 对象里数组节点的索引路径,如".a"
         * @param {any[]} items 插入元素，支持多个
         */
        arrayNodeAppend(id: string, path: string, ...items: any[]): Promise<void>
    
        /**
         * 往对象里的数组类型节点头部添加元素
         * @param {string} id 对象id
         * @param {string} path 对象里数组节点的索引路径,如".a"
         * @param {any[]} items 插入元素，支持多个
         */
        arrayNodeUnshift(id: string, path: string, ...items: any[]): Promise<void>
    
        /**
         * 往对象里的数组类型节点某个位置添加元素
         * @param {string} id 对象id
         * @param {string} path 对象里数组节点的索引路径,如".a"
         * @param {number} index 插入的索引位置
         * @param {any} item 插入元素
         */
        arrayNodeInsert(id: string, path: string, index: number, item: any): Promise<void>
    
        /**
         * 删除对象里的数组类型节点里的元素
         * @param {string} id 对象id
         * @param {string} path 对象里数组节点的索引路径,如".a"
         * @param {number} index 删除的元素的索引位置
         */
        arrayNodeDel(id: string, path: string, index: number): Promise<void>
    
        /**
         * 弹出对象里的数组类型节点尾部元素
         * @param {string} id 对象id
         * @param {string} path 对象里数组节点的索引路径,如".a"
         */
        arrayNodePop(id: string, path: string): Promise<any>
    
        /**
         * 弹出对象里的数组类型节点头部元素
         * @param {string} id 对象id
         * @param {string} path 对象里数组节点的索引路径,如".a"
         */
        arrayNodeShift(id: string, path: string): Promise<any>
    
        /**
         * 对象查找排序分页操作
         */
        find({where, sort, limit}: ObjectFindParams): Promise<any[]>

        /**
         * 对象查找排序分页分组查询单个字段操作
         */
        fieldFind({field, where, sort, limit, group}: ObjectFieldFindParams): Promise<any[]>
    
        /**
         * 统计对象数量，支持条件查询
         * @param {LogicWhereClass.Base} where 查询条件
         */
        count(where?: LogicWhereClass.Base): Promise<number>
    }
    
    /**
     * 关系
     */
    class Relation {
        /**
         * 关系
         * @param relationName 关系名
         */
        constructor(relationName: string);

        /**
         * 获取主key与关联key间的关系信息
         * @param {string | number} subject 主keyId
         * @param {string | number} object 关联keyId
         */
        fetch(subject: string | number, object: string | number): Promise<any>
    
        /**
         * 新建／更新主key与关联key间的关系信息
         * @param {any} data 主与关联key间的关系信息
         */
        put(data: any): Promise<void>
    
        /**
         * 判断主key与关联key间的是否有关系信息
         * @param {string | number} subject 主keyId
         * @param {string | number} object 关联keyId
         */
        has(subject: string | number, object: string | number): Promise<boolean>
    
        /**
         * 删除主key与关联key间的关系信息
         * @param {string | number} subject 主keyId
         * @param {string | number} object 关联keyId
         */
        remove(subject: string | number, object: string | number): Promise<void>
    
        /**
         * 清空所有与主key相关的关系信息
         * @param {string | number} subject 主keyId
         */
        clear(subject: string | number): Promise<void>
    
        /**
         * 统计跟主key相关的关系数量，支持条件查询
         * @param {string | number} subject 主keyId
         * @param {LogicWhereClass.Base} filter 过滤条件
         */
        count(subject: string | number, filter?: LogicWhereClass.Base): Promise<number>
    
        /**
         * 列出主key相关的关系，支持条件查询/排序/分页
         * @param subject 主keyId 
         * @param {LogicSortClass.Base | LogicSortClass.Base[]} sort 结果排序
         * @param {LogicLimitClass.Base} limit 偏移条目
         * @param {LogicWhereClass.Base} filter 过滤条件
         */
        list(
            subject: string | number, 
            sort?: (LogicSortClass.Base | LogicSortClass.Base[]), 
            limit?: LogicLimitClass.Base, 
            filter?: LogicWhereClass.Base 
        ): Promise<any[]>
    }

    /**
     * 存储媒介基类
     */
    class BackendMedia {
        /**
         * 
         * @param {Object} connParam 媒介链接参数
         * @param {string[]} indexes 索引数组
         */
        constructor(connParam, indexes)

        /**
         * 高级数据操作配置
         */
        get support(): {
            objectFind: boolean,
            objectCount: boolean,
            objectArrayNodeAppend: boolean,
            objectArrayNodeUnshift: boolean,
            objectArrayNodeInsert: boolean,
            objectArrayNodeDel: boolean,
            objectArrayNodePop: boolean,
            objectArrayNodeShift: boolean
        }

        /**
         * 设置存储媒介名
         */
        static get media(): string

        /**
         * 获取对象
         * @param {string} id objectId
         */
        objectGet(id: string): Promise<any>
    
        /**
         * 新增/更新对象
         * @param {object} data 对象内容
         */        
        objectSet(id: string, value: any): Promise<void>
 
        /**
         * 删除对象
         * @param {string} id 对象id
         */        
        objectDel(id: string): Promise<void>
    
        /**
         * 判断对象是否存在
         * @param {string} id 对象id
         */        
        objectHas(id: string): Promise<boolean>
    
        /**
         * 往对象里的数组类型节点尾部添加元素
         * @param {string} id 对象id
         * @param {string} path 对象里数组节点的索引路径,如".a"
         * @param {any[]} items 插入元素，支持多个
         */        
        objectArrayNodeAppend(id: string, path: string, items: any[]): Promise<void>
    
        /**
         * 往对象里的数组类型节点头部添加元素
         * @param {string} id 对象id
         * @param {string} path 对象里数组节点的索引路径,如".a"
         * @param items 插入元素，支持多个
         */        
        objectArrayNodeUnshift(id: string, path: string, items: any[]): Promise<void>
    
        /**
         * 往对象里的数组类型节点某个位置添加元素
         * @param {string} id 对象id
         * @param {string} path 对象里数组节点的索引路径,如".a"
         * @param {number} index 插入的索引位置
         * @param {any} item 插入元素
         */        
        objectArrayNodeInsert(id: string, path: string, index: number, item: any): Promise<void>
    
        /**
         * 删除对象里的数组类型节点里的元素
         * @param {string} id 对象id
         * @param {string} path 对象里数组节点的索引路径,如".a"
         * @param {number} index 删除的元素的索引位置
         */        
        objectArrayNodeDel(id: string, path: string, index: number): Promise<void>
    
        /**
         * 弹出对象里的数组类型节点尾部元素
         * @param {string} id 对象id
         * @param {string} path 对象里数组节点的索引路径,如".a"
         */        
        objectArrayNodePop(id: string, path: string): Promise<any>
    
        /**
         * 弹出对象里的数组类型节点头部元素
         * @param {string} id 对象id
         * @param {string} path 对象里数组节点的索引路径,如".a"
         */        
        objectArrayNodeShift(id: string, path: string): Promise<any>
    
        /**
         * 对象查找排序分页操作
         * @param {LogicWhereClass.Base} where 查询参数
         * @param {LogicSortClass.Base | LogicSortClass.Base[]} sort 排序参数
         * @param {LogicLimitClass.Base} limit 分页参数
         */
        objectFind(where: LogicWhereClass.Base, sort: (LogicSortClass.Base | LogicSortClass.Base[]) , limit: LogicLimitClass.Base): Promise<any[]>

        /**
         * 对象查找排序分页分组查询单个字段操作
         * @param {LogicFieldClass.Base | LogicFieldClass.Base[]} field 查询参数
         * @param {LogicWhereClass.Base} where 查询参数
         * @param {LogicSortClass.Base | LogicSortClass.Base[]} sort 排序参数
         * @param {LogicLimitClass.Base} limit 分页参数
         * @param {LogicGroupClass.Base | LogicGroupClass.Base[]} group 排序参数
         */
         objectFieldFind(field:LogicFieldClass.Base ,where: LogicWhereClass.Base, sort: (LogicSortClass.Base | LogicSortClass.Base[]) , limit: LogicLimitClass.Base , group: LogicGroupClass.Base): Promise<any[]>
    
        /**
         * 统计对象数量，支持条件查询
         * @param　{LogicWhereClass.Base} where 查询参数
         */
        objectCount(where: LogicWhereClass.Base): Promise<number>
    
        /**
         * 获取主key与关联key间的关系信息
         * @param {string | number} subject 主keyId
         * @param {string | number} object 关联keyId
         */        
        relationFetch(subject: string | number, object: string | number): Promise<any>
         
        /**
         * 新建／更新主key与关联key间的关系信息
         * @param data 主与关联key间的关系信息
         */        
        relationPut(data: any): Promise<void>
    
        /**
         * 删除主key与关联key间的关系信息
         * @param {string | number} subject 主keyId
         * @param {string | number} object 关联keyId
         */       
        relationRemove(subject: string | number, object: string | number): Promise<void>
    
        /**
         * 判断主key与关联key间的是否有关系信息
         * @param {string | number} subject 主keyId
         * @param {string | number} object 关联keyId
         */         
        relationHas(subject: string | number, object: string | number): Promise<boolean>
    
        /**
         * 列出主key相关的关系，支持条件查询/排序/分页
         * @param {string | number} subject 主keyId
         * @param {LogicSortClass.Base} sort 排序参数
         * @param {LogicLimitClass.Base} limit 分页参数
         * @param {LogicWhereClass.Base} filter 筛选参数
         */
        relationList(
            subject: string | number, 
            sort: LogicSortClass.Base, 
            limit: LogicLimitClass.Base, 
            filter: LogicWhereClass.Base
        ): Promise<any[]>
         
        /**
         * 
         * @param {string | number} subject 主keyId
         * @param {LogicWhereClass.Base} filter 筛选参数
         */
        relationCount(subject: string | number, filter: LogicWhereClass.Base): Promise<number>
    
        /**
         * 清空所有与主key相关的关系信息
         * @param {string | number} subject 主keyId
         */        
        relationClear(subject: string | number): Promise<void>
    }

    /**
     * 配置ORM参数
     */
    function setup({
        objectSchemaPath, 
        objectRouterPath, 
        relationSchemaPath, 
        relationRouterPath, 
        strict
    }: SetupParams): void

    /**
     * 注册存储媒介
     * @param {BackendMedia[]} medias Media类对象
     */
    function registryMedia(...medias: BackendMedia[]): void

    /**
     * 逻辑运算
     */
    namespace Logic {
        /**
         * SQL:AND操作
         * @param {(LogicWhereClass.Base | LogicSortClass.Base | LogicLimitClass.Base)[]} items 标准Logic
         */
        function whereAnd(...items: any[]): LogicWhereClass.WhereAnd

        /**
         * SQL:OR操作
         * @param {(LogicWhereClass.Base | LogicSortClass.Base | LogicLimitClass.Base)[]} items 标准Logic
         */
        function whereOr(...items: any[]): LogicWhereClass.WhereOr
    
        /**
         * SQL:NOT操作
         * @param {LogicWhereClass.Base | LogicSortClass.Base | LogicLimitClass.Base} item 标准Logic
         */
        function whereNot(item: any): LogicWhereClass.WhereNot
    
        /**
         * SQL:IN操作
         * @param {string} field 字段路径
         * @param {any[]} values 查询值
         */
        function whereIn(field, ...values: (string | number | boolean)[]): LogicWhereClass.WhereIn
    
        /**
         * SQL:LIKE操作
         * @param {string} field 字段路径
         * @param {string} value 查询值 
         */
        function whereLike(field: string, value: string): LogicWhereClass.WhereLike
    
        /**
         * SQL:=操作
         * @param {string} field 字段路径
         * @param {any} value 查询值 
         */
        function whereEq(field: string, value: string | number | boolean): LogicWhereClass.WhereEq
    
        /**
         * SQL:!=操作
         * @param {string} field 字段路径
         * @param {any} value 查询值 
         */
        function whereNq(field: string, value: string | number | boolean): LogicWhereClass.WhereNq
    
        /**
         * SQL:>=操作
         * @param {string} field 字段路径
         * @param {number} value 查询值 
         */
        function whereGe(field: string, value: string | number | boolean): LogicWhereClass.WhereGe
    
        /**
         * SQL:>操作
         * @param {string} field 字段路径
         * @param {number} value 查询值 
         */
        function whereGt(field: string, value: string | number | boolean): LogicWhereClass.WhereGt
    
        /**
         * SQL:<=操作
         * @param {string} field 字段路径
         * @param {number} value 查询值 
         */
        function whereLe(field: string, value: string | number | boolean): LogicWhereClass.WhereLe
    
        /**
         * SQL:<操作
         * @param {string} field 字段路径
         * @param {number} value 查询值 
         */
        function whereLt(field: string, value: string | number | boolean): LogicWhereClass.WhereLt
    
        /**
         * SQL:MATCH AGAINST操作
         * @param {string} field 字段路径
         * @param {string} value 查询值 
         */
        function whereContain(field: string, value: string | number | boolean): LogicWhereClass.WhereContain
    
        /**
         * SQL:BETWEEN操作
         * @param {string} field 字段路径
         * @param {number} from 查询起始值
         * @param {number} to 查询终止值
         */
        function whereBetween(field: string, from: number, to: number): LogicWhereClass.WhereBetween
    
        /**
         * SQL:IS NULL操作
         * @param {string} field 字段路径
         */
        function whereIsUndef(field: string): LogicWhereClass.WhereIsUndef

        /**
         * SQL:IS NOT NULL操作
         * @param {string} field 字段路径
         */
        function whereIsDef(field: string): LogicWhereClass.WhereIsDef

        /**
         * SQL:SORT操作
         * @param {string} field 排序字段路径
         * @param {string} order "ASC" | "DESC"
         */
        function sort(field: string, order?: "ASC" | "DESC"): LogicSortClass.Sort
    
        /**
         * SQL:LIMIT操作
         * @param {number} limit 限制数
         * @param {number} skip 偏移量
         */
        function limit(limit: number, skip?: number): LogicLimitClass.Limit

         /**
         * SQL:SELECT操作
         * @param {string} field 查询字段路径
         * @param {string} alias 查询字段路径别名
         */
        function field(field: string, alias:string): LogicFieldClass.Field

        /**
         * SQL:GROUP操作
         * @param {string} field 查询字段路径
         */
        function group(field: string): LogicGroupClass.Group

        /**
         * json形式的Logic反序列化为对象
         * @param logicJsonString 
         */
        function normalize(logicJsonString: string): (LogicWhereClass.Base | LogicSortClass.Base | LogicSortClass.Base[] | LogicLimitClass.Base)
    }

    /**
     * 值类型
     */
    namespace Type {
        /**
         * 字符类型
         * @param {string} pattern 正则
         */
        function string(pattern?: string | RegExp): TypeClass.String;

        /**
         * 数值类型
         * @param {number} min 最小值 
         * @param {number} max 最大值
         */
        function number(min?: number, max?: number): TypeClass.Number;

        /**
         * 整数类型
         * @param {number} min 最小值 
         * @param {number} max 最大值
         */
        function integer(min?: number, max?: number): TypeClass.Integer;

        /**
         * 布尔类型
         */
        function boolean(): TypeClass.Boolean;

        /**
         * null值
         */
        function NULL(): TypeClass.Null;

        /**
         * null值
         */
        function empty(): TypeClass.Null;

        /**
         * 对象类型
         * @param {object} properties 对象属性
         */
        function object(properties?: any): TypeClass.Object;

        /**
         * 数组类型
         * @param {any} item 数组元素
         */
        function array(item?: any): TypeClass.Array;
    }
}

declare namespace TypeClass {
    class Base {
        /**
         * 字段的简洁描述
         * @param {string} title 简洁描述
         */
        title(title: string): this;

        /**
         * 字段的详细描述
         * @param {string} desc 详细描述
         */        
        desc(desc: string): this;

        /**
         * 主动schema抛错
         */        
        invalid(): this;
    }

    class String extends Base {
        /**
         * 设置枚举值
         * @param  {...any} enumArr 枚举值，多个以逗号隔开
         */             
        enum(...enumArr: string[]): this;

        /**
         * 描述字符串最大长度
         * @param {number} len 最大长度
         */        
        maxLength(len: number): this;

        /**
         * 描述字符串最小长度
         * @param {integer} len 最小长度
         */        
        minLength(len: number): this;

        /**
         * 描述字符串确切长度
         * @param {integer} len 长度确切值
         */        
        length(len: number): this;

        /**
         * 使用正则描述字符串
         * @param {string|Regex} regex 正则对象或者正则字符串
         */        
        pattern(regex: string | RegExp): this;

        /**
         * 例子描述
         * @param {string} example 例子
         */         
        example(example: string): this;

        /**
         * 字段开启索引
         */        
        index(): this;

        /**
         * 默认值，当其被require，取操作为undefined时，自动补上默认值
         * @param {string} default 默认值
         */             
        default(value: string): this;
    }

    class Number extends Base {
        /**
         * 设置枚举值
         * @param  {...any} enumArr 枚举值，多个以逗号隔开
         */             
        enum(...enumArr: number[]): this;

        /**
         * 描述最大值
         * @param {number} num 最大值
         */        
        max(len: number): this;

        /**
         * 描述最小值
         * @param {number} num 最小值
         */        
        min(len: number): this;

        /**
         * 小于设置值
         * @param {number} num 设置值
         */        
        exclusiveMax(num: number): this;

        /**
         * 大于设置值
         * @param {number} num 设置值
         */        
        exclusiveMin(num: number): this;

        /**
         * 例子描述
         * @param {number} example 例子
         */ 
        example(example: number): this;

        /**
         * 字段开启索引
         */
        index(): this;

        /**
         * 默认值，当其被require，取操作为undefined时，自动补上默认值
         * @param {number} default 例子
         */              
        default(value: number): this;
    }

    class Integer extends Number { }

    class Null extends Base {
        /**
         * 默认值，当其被require，取操作为undefined时，自动补上默认值
         * @param {null} default 例子
         */             
        default(value: null): this;
    }

    class Boolean extends Base {
        /**
         * 设置枚举值
         * @param  {...any} enumArr 枚举值，多个以逗号隔开
         */        
        enum(...enumArr: boolean[]): this;

        /**
         * 例子描述
         * @param {boolean} example 例子
         */        
        example(example: boolean): this;

        /**
         * 默认值，当其被require，取操作为undefined时，自动补上默认值
         * @param {boolean} example 例子
         */        
        default(value: boolean): this;
    }

    class Object extends Base {
        /**
         * 描述object对象必含的字段
         * @param  {...string} propertyNameArr 必含的字段，多个以逗号隔开
         */        
        require(...propertyNameArr: string[]): this;

        /**
         * 描述properties里所有的字段都必含，注意必须先描述properties或者patternProperties
         */        
        requireAll(): this;

        /**
         * 描述object对象里含有的字段及其类型
         * @param {object} properties 描述体
         */        
        properties(properties: any): this;

        /**
         * 描述object对象里含有的字段(使用正则描述key)及其类型
         * @param {object} patternProperties 
         */        
        patternProperties(patternProperties: any): this;

        /**
         * 描述object对象是否允许出现properties/patternProperties里未定义的字段，默认为是
         * @param {boolean} isAllow 
         */        
        additionalProperties(isAllow?: boolean): this;

        /**
         * 对象默认置空值，当其被require，取操作为undefined时，自动补上空对象
         */     
        defaultEmpty(): this;

        /**
         * 分情况描述-if
         */        
        if: this;

        /**
         * 分情况描述-当符合某个条件时，进行描述对象
         */        
        then: this;

        /**
         * 分情况描述-elseIf
         */        
        elseIf: this;

        /**
         * 分情况描述-else
         */        
        else: this;

        /**
         * 分情况描述-结束标准
         */        
        endIf: this;
    }

    class Array extends Base {
        /**
         * 描述数组元素个数最大值
         * @param {number} num - 最大值
         */        
        maxItems(num: number): this;

        /**
         * 描述数组元素个数最小值
         * @param {number} num - 最小值
         */        
        minItems(num: number): this;

        /**
         * 描述数组元素个数,相当于同时设置minItems,maxItems为同一个值
         * @param {number} num - 确切值
         */        
        length(num: number): this;

        /**
         * 描述数组元素结构
         * @param {any} schemaOrSugar - 元素结构
         */        
        item(schemaOrSugar: any): this;

        /**
         * 数组默认值数量(需要配合item里的default！)，当其被require，取操作为undefined时，自动补上n个item默认值
         * @param {number} num 数量
         */      
        defaultAmount(num: number): this;

        /**
         * 数组默认置空值，当其被require，取操作为undefined时，自动补上空数组
         */     
        defaultEmpty(): this;
    }    
}

declare namespace LogicWhereClass {
    class Base {
        /**
         * Logic对象序列化为json字符串形式
         */
        toJson(): object
    }

    class WhereAnd extends Base {
        constructor(...items: any[])
    }

    class WhereOr extends Base {
        constructor(...items: any[])
    }
    
    class WhereNot extends Base {
        constructor(item: any)
    }

    class WhereIn extends Base {
        constructor(field, ...values: (string | number | boolean)[])
    }

    class WhereLike extends Base {
        constructor(field: string, value: string)
    }

    class WhereEq extends Base {
        constructor(field: string, value: string | number | boolean)
    }

    class WhereNq extends Base {
        constructor(field: string, value: string | number | boolean)
    }

    class WhereGe extends Base {
        constructor(field: string, value: string | number | boolean)
    }

    class WhereGt extends Base {
        constructor(field: string, value: string | number | boolean)
    }

    class WhereLe extends Base {
        constructor(field: string, value: string | number | boolean)
    }

    class WhereLt extends Base {
        constructor(field: string, value: string | number | boolean)
    }

    class WhereContain extends Base {
        constructor(field: string, value: string | number | boolean)
    }

    class WhereBetween extends Base {
        constructor(field: string, from: number, to: number)
    }

    class WhereIsUndef extends Base {
        constructor(field: string)
    }

    class WhereIsDef extends Base {
        constructor(field: string)
    }
}

declare namespace LogicSortClass {
    class Base {
        /**
         * Logic对象序列化为json字符串形式
         */
        toJson(): string
    }

    class Sort extends Base {
        constructor(field: string, order?: "ASC" | "DESC")
    }
}

declare namespace LogicLimitClass {
    class Base {
        /**
         * Logic对象序列化为json字符串形式
         */
        toJson(): string
    }

    class Limit extends Base {
        constructor(limit: number, skip?:number)
    }
}

declare namespace LogicGroupClass {
    class Base {
        /**
         * Logic对象序列化为json字符串形式
         */
        toJson(): string
    }

    class Group extends Base {
        constructor(field: string)
    }
}

declare namespace LogicFieldClass {
    class Base {
        /**
         * Logic对象序列化为json字符串形式
         */
        toJson(): string
    }

    class Field extends Base {
        constructor(field: string, alias: string)
    }
}

declare interface SetupParams {
    /**
     * objectSchema绝对路径
     */
    objectSchemaPath: string 

    /**
     * objectRouterPath绝对路径
     */
    objectRouterPath: string 

    /**
     * relationSchemaPath绝对路径
     */
    relationSchemaPath: string 

    /**
     * relationRouterPath绝对路径
     */
    relationRouterPath: string 

    /**
     * 严格模式，默认true, 当数据库中的值结构跟schema数据描述不相符时，为false时会依照schema描述重新构造拷贝数据后，再进行schema校验
     */
    strict?: boolean
}

declare interface ObjectFindParams {
    /**
     * 过滤条件
     */
    where?: LogicWhereClass.Base

    /**
     * 排序规则
     */
    sort?: LogicSortClass.Base | LogicSortClass.Base[]
    
    /**
     * 分页规则
     */
    limit?: LogicLimitClass.Base
}

declare interface ObjectFieldFindParams {
    /**
     * 过滤条件
     */
     field?: LogicFieldClass.Base

    /**
     * 过滤条件
     */
    where?: LogicWhereClass.Base

    /**
     * 排序规则
     */
    sort?: LogicSortClass.Base | LogicSortClass.Base[]
    
    /**
     * 分页规则
     */
    limit?: LogicLimitClass.Base

    /**
     * 分页规则
     */
     group?: LogicGroupClass.Base
}

export = ORM;