const {integer, boolean, string, object, array, number, empty, NULL} = require('../../../../').Type;

module.exports = object({
    id: string().length(16),
    friends: array().item(object({
        fid: string(),
        time: integer()
    })),
    autoFixObject: {
        count: integer()
    },
    autoFixObjectDefaultEmpty: object({
        count: integer()
    }),
    autoFixArray: array(string()),
    autoFixArrayDefaultEmpty: array(string()),
    autoFixInteger: integer(),
    autoFixNumber: number(),
    autoFixBoolean: boolean(),
    autoFixString: string(),
    autoFixNull: NULL(),
    autoFixEmpty: empty()
}).require('id');