const {integer, boolean, string, object, array} = require('../../../../').Type;

module.exports = object({
    id: integer(),
    title: string(),
    content: string(),
    sendTime: integer()
}).require('id');