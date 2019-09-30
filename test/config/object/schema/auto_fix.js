const {integer, boolean, string, object, array, number, empty, NULL} = require('../../../../').Type;

module.exports = {
    id: string().length(16),
    friends: array().item({
        fid: string().default("fid"),
        time: integer().default(1)
    }).defaultAmount(2),
    autoFixObject: {
        count: integer().default(10)
    },
    autoFixArray: array(string().default("111")).defaultAmount(2),
    autoFixInteger: integer().default(0),
    autoFixNumber: number().default(0.9),
    autoFixBoolean: boolean().default(false),
    autoFixString: string().default("default"),
    autoFixNull: NULL().default(null),
    autoFixEmpty: empty().default(null),
};