module.exports = {
    definitionDir: {
        object: '',
        relation: ''
    },
    removeSchemaUndefinedProperties: false,
    indexes: {},
    medias : {
        [require('../module/router/backend/mysql').media]: require('../module/router/backend/mysql'),
        [require('../module/router/backend/redis').media]: require('../module/router/backend/redis'),
    }
};