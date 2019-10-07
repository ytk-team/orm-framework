const {integer, boolean, string, object, array, number, empty, NULL} = require('../../../../../').Type;

module.exports = object({
    subject: string().length(16),
    object: string().length(16),
    friends: array().item({
        fid: string(),
        time: integer()
    }),
    autoFixObject: {
        count: integer()
    },
    autoFixArray: array(string()),
    autoFixInteger: integer(),
    autoFixNumber: number(),
    autoFixBoolean: boolean(),
    autoFixString: string(),
    autoFixNull: NULL(),
    autoFixEmpty: empty(),
}).require('subject', 'object')