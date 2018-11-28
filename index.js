const BaseSchema  = require('./src/lib/schema/base/index.js');
const ObjectSchema  = require('./src/lib/schema/object/index.js');
const ArraySchema   = require('./src/lib/schema/array');
const StringSchema  = require('./src/lib/schema/string');
const NumberSchema  = require('./src/lib/schema/number');
const IntegerSchema = require('./src/lib/schema/integer');
const BooleanSchema = require('./src/lib/schema/boolean');
const NullSchema    = require('./src/lib/schema/null');

module.exports = {
    Object: require('./src/object'),
    Relation: require('./src/relation'),
    Type: require('./src/lib/type'),
    Logic: require('./src/lib/logic'),
    BackendMedia: require('./src/lib/router/backend/base.js'),
    setup: ({objectPath, relationPath, removeSchemaUndefinedProperties = false}) => {
        require('./src/global').definitionDir.object = objectPath;
        require('./src/global').definitionDir.relation = relationPath;
        require('./src/global').removeSchemaUndefinedProperties = removeSchemaUndefinedProperties;
    },
    registryMedia: (...medias) => medias.forEach(_ => require('./src/global').medias[_.media] = _)
};
