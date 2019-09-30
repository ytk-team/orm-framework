const Fixer = require('../../fixer');

const ArrayFixer = (schema, value, strict) => {
    if (schema.items === undefined) return value;
    if (Fixer.hasDefaultKeyword(schema.items)) {
        let fixer = Fixer.from(schema.items);
        if (value === undefined) {
            let defaultAmount = schema.defaultAmount === undefined ? 1 : schema.defaultAmount;
            value = Array(defaultAmount).fill(undefined);
        }
        
        return value.map(_ => fixer.fix(_, strict));
    }
    else {
        return value;
    }
}

module.exports =  ArrayFixer;