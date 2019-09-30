const {integer, boolean, string, object, array, number, empty} = require('../../../../').Type;

module.exports = {
    id: string().length(16),
    name: string(),
    gender: integer().enum(0, 1).index(),
    money: number().min(0),
    null: empty(),
    location: {
        lng: string().index().length(6),
        lat: string().desc('lat')
    },
    isVip: boolean(),
    friends: array().item({
        fid: string().pattern(/^[A-Za-z0-9]{1,}$/).index(),
        time: integer()
    })
};