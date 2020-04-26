const LogicBase = require('./base');
const Type = {
    WhereAnd: require('./where/and'),
    WhereOr: require('./where/or'),
    WhereNot: require('./where/not'),
    WhereIn: require('./where/in'),
    WhereBetween: require('./where/between'),
    WhereLike: require('./where/like'),
    WhereEq: require('./where/eq'),
    WhereNq: require('./where/nq'),
    WhereGt: require('./where/gt'),
    WhereGe: require('./where/ge'),
    WhereLt: require('./where/lt'),
    WhereLe: require('./where/le'),
    WhereContain: require('./where/contain'),
    WhereIsNull: require('./where/is_null'),
    WhereIsNotNull: require('./where/is_not_null'),
    Sort: require('./sort'),
    Limit: require('./limit'),
}

module.exports = class {
    static get Type() {
        return Type;
    }

    static whereAnd(...items) {
        return new Type.WhereAnd(items);
    }

    static whereOr(...items) {
        return new Type.WhereOr(items);
    }

    static whereNot(item) {
        return new Type.WhereNot(item);
    }

    static whereIn(field, ...values) {
        return new Type.WhereIn(field, values);
    }

    static whereLike(field, value) {
        return new Type.WhereLike(field, value);
    }

    static whereEq(field, value) {
        return new Type.WhereEq(field, value);
    }

    static whereNq(field, value) {
        return new Type.WhereNq(field, value);
    }

    static whereGe(field, value) {
        return new Type.WhereGe(field, value);
    }

    static whereGt(field, value) {
        return new Type.WhereGt(field, value);
    }

    static whereLe(field, value) {
        return new Type.WhereLe(field, value);
    }

    static whereLt(field, value) {
        return new Type.WhereLt(field, value);
    }

    static whereContain(field, value) {
        return new Type.WhereContain(field, value);
    }

    static whereBetween(field, from, to) {
        return new Type.WhereBetween(field, from, to);
    }

    static whereIsNull(field) {
        return new Type.WhereIsNull(field);
    }

    static whereIsNotNull(field) {
        return new Type.WhereIsNotNull(field);
    }

    static sort(field, order = "ASC") {
        return new Type.Sort(field, order);
    }

    static limit(limit, skip = 0) {
        return new Type.Limit(limit, skip);
    }


    static normalize(logic) {
        if (Array.isArray(logic)) {
            if (logic.every(_ => !(_ instanceof LogicBase))) {
                return logic.map(_ => this.normalize(_));
            }
            else {
                return logic;
            }
        }
        else {
            if(logic instanceof LogicBase) return logic;
        }

        switch(logic.type) {
            case 'WhereAnd':
            case 'WhereOr':
                return new Type[logic.type](logic.fields._items.map(_ => this.normalize(_)));
            case 'WhereIn':   
                return new Type[logic.type](logic.fields._field ,logic.fields._items); 
            case 'WhereLike':
            case 'WhereEq':
            case 'WhereNq':
            case 'WhereGe':
            case 'WhereGt':
            case 'WhereLe':
            case 'WhereLt':
            case 'WhereContain':            
                return new Type[logic.type](logic.fields._field ,logic.fields._value); 
            case 'WhereIsNull':
            case 'WhereIsNotNull':               
                return new Type[logic.type](logic.fields._field);                 
            case 'WhereNot':
                return new Type[logic.type](this.normalize(logic.fields._item));
            case 'WhereBetween':
                return new Type[logic.type](logic.fields._field, logic.fields._from, logic.fields._to);
            case 'Sort':
                return new Type[logic.type](logic.fields._field, logic.fields._order);  
            case 'Limit':
                return new Type[logic.type](logic.fields._limit, logic.fields._skip);  
            default:
                throw new Error(`不支持${logic.type}反序列化`);
        }
    }
}

