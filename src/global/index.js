module.exports = {
    definitionDir: {
        object: '',
        relation: ''
    },
    strict: true,
    indexes: {},
    medias : {
        [require('../module/router/backend/mysql').media]: require('../module/router/backend/mysql'),
        [require('../module/router/backend/redis').media]: require('../module/router/backend/redis'),
    }
};