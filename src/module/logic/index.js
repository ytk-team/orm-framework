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
    Sort: require('./sort'),
    Limit: require('./limit'),
}

module.exports = {
    Type,
    whereAnd: (...items) => new Type.WhereAnd(items),
    whereOr: (...items) => new Type.WhereOr(items),
    whereNot: (item) => new Type.WhereNot(item),
    whereIn: (field, ...values) => new Type.WhereIn(field, values),
    whereLike: (field, value) => new Type.WhereLike(field, value),
    whereEq: (field, value) => new Type.WhereEq(field, value),
    whereNq: (field, value) => new Type.WhereNq(field, value),
    whereGe: (field, value) => new Type.WhereGe(field, value),
    whereGt: (field, value) => new Type.WhereGt(field, value),
    whereLe: (field, value) => new Type.WhereLe(field, value),
    whereLt: (field, value) => new Type.WhereLt(field, value),
    whereBetween: (field, from, to) => new Type.WhereBetween(field, from, to),
    sort: (field, order = "ASC") => new Type.Sort(field, order),
    limit: (limit, skip = 0) => new Type.Limit(limit, skip)
}

