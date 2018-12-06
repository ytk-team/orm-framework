const Type = require('../module/logic').Type;
 
module.exports = class {
    _getNodeSchema(path) {
        return path.split('.').slice(1).reduce((prev, curr) => {
            if (curr == '') return prev;
            if (prev.type == "object") {
                return (prev.properties || prev.patternProperties)[curr];
            }
            else if (prev.type == "array") {
                return prev.items;
            }
            else {
                return prev;
            }
        }, this._schema);
    }

    _getWhereAllFields(where) {
        if (where instanceof Type.WhereAnd || where instanceof Type.WhereOr) {
            return where.items.reduce((prev, item) => prev.concat(this._getWhereAllFields(item)), []);
        }
        else if (where instanceof Type.WhereNot) {
            return this._getWhereAllFields(where.item);
        }
        else if (
            where instanceof Type.WhereIn || 
            where instanceof Type.WhereBetween ||
            where instanceof Type.WhereLike ||
            where instanceof Type.WhereEq ||
            where instanceof Type.WhereNq ||
            where instanceof Type.WhereGe ||
            where instanceof Type.WhereGt ||
            where instanceof Type.WhereLe ||
            where instanceof Type.WhereLt
        ) {
            return [where.field];
        }
    }
}