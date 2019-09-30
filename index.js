module.exports = {
    Object: require('./src/core/object'),
    Relation: require('./src/core/relation'),
    Type: require('./src/module/type'),
    Logic: require('./src/module/logic'),
    BackendMedia: require('./src/module/router/backend/base.js'),
    setup: ({objectSchemaPath, objectRouterPath, relationSchemaPath, relationRouterPath, strict = true}) => {
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
