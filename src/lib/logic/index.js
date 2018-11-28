const Type = {
    WhereAnd: require('./where/and'),
    WhereOr: require('./where/or'),
    WhereNot: require('./where/not'),
    WhereIn: require('./where/in'),
    WhereBetween: require('./where/between'),
    WhereLike: require('./where/like'),
    WhereOperator: require('./where/operator'),
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
    whereOperator: (field, op, value) => new Type.WhereOperator(field, op, value),
    whereBetween: (field, from, to) => new Type.WhereBetween(field, from, to),
    sort: (field, order = "ASC") => new Type.Sort(field, order),
    limit: (limit, skip = 0) => new Type.Limit(limit, skip)
}

