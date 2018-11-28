module.exports = {
    definitionDir: {
        object: '',
        relation: ''
    },
    removeSchemaUndefinedProperties: false,
    indexes: {},
    medias : {
        [require('../lib/router/backend/mysql').media]: require('../lib/router/backend/mysql'),
        [require('../lib/router/backend/redis').media]: require('../lib/router/backend/redis'),
    }
};