const BaseSchema  = require('./src/module/schema/base/index.js');
const ObjectSchema  = require('./src/module/schema/object/index.js');
const ArraySchema   = require('./src/module/schema/array');
const StringSchema  = require('./src/module/schema/string');
const NumberSchema  = require('./src/module/schema/number');
const IntegerSchema = require('./src/module/schema/integer');
const BooleanSchema = require('./src/module/schema/boolean');
const NullSchema    = require('./src/module/schema/null');

module.exports = {
    Object: require('./src/core/object'),
    Relation: require('./src/core/relation'),
    Type: require('./src/module/type'),
    Logic: require('./src/module/logic'),
    BackendMedia: require('./src/module/router/backend/base.js'),
    setup: ({objectSchemaPath, objectRouterPath, relationSchemaPath, relationRouterPath, strict = false}) => {
        require('./src/global').definitionDir.objectPath = {
            schema: objectSchemaPath,
            router: objectRouterPath
        };
        require('./src/global').definitionDir.relationPath = {
            schema: relationSchemaPath,
            router: relationRouterPath
        };
        require('./src/global').strict = strict;
    },
    registryMedia: (...medias) => medias.forEach(_ => require('./src/global').medias[_.media] = _)
};
