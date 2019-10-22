const Fixer = require('../../fixer');

const ArrayFixer = (schema, value, strict) => {
    if (value === undefined && schema.default !== undefined) {
        if (schema.defaultAmount !== undefined && schema.defaultAmount !== 0) {
            throw new Error(`使用defaultEmpty关键字时，defaultAmount应为0`);
        }
        if (schema.minItems !== undefined && schema.minItems !== 0) {
            throw new Error(`使用defaultEmpty关键字时，minItems应为0`);
        }
        return schema.default; //即[]
    }
    
    if (schema.items === undefined) return value;
    if (Fixer.hasDefaultKeyword(schema.items)) {
        let fixer = Fixer.from(schema.items);
        let minAmount = Math.max(
            schema.defaultAmount || 0,
            schema.minItems || 0
        );

        value = value || [];
        if (value.length < minAmount) {
            value = value.concat(Array(minAmount - value.length).fill(undefined)); 
        }

        return value.map(_ => fixer.fix(_, strict));
    }
    else {
        return value;
    }
}

module.exports =  ArrayFixer;