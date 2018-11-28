const {integer, boolean, string, object, array, number, empty} = require('../../../../').Type;

module.exports = {
    id: string().length(16),
    name: string(),
    gender: integer().enum(0, 1).index(),
    money: number().min(0),
    null: empty(),
    location: {
        lng: string().index().length(6),
        lat: string().desc('lat').default("2")
    },
    isVip: boolean(),
    friends: array().item({
        fid: string().pattern(/^[A-Za-z0-9]{1,}$/),
        time: integer()
    }),
    extraObject: object({
        count: integer()
    }).default({count: 10}),
    extraArray: array(string()).default(['default array']),
    extraInteger: integer().default(0),
    extraNumber: number().default(0.9).index(),
    extraBoolean: boolean().default(false),
    extraString: string().default("default").index().maxLength(32)
};