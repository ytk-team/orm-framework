module.exports = class {
    static create(connParam, indexes) {
        let {medias} = require('../../../global');
        if (medias[connParam.media] == undefined) throw new Error(`unsupported media [${connParam.media}]`);
        return new medias[connParam.media](connParam, indexes);
    }
}