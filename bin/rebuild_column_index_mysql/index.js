#!/usr/bin/env node
const opts = require('opts');
const path = require('path');
const Rebuilder = require('./rebuilder');

opts.parse(
    [
        { 
            short       : 's',
            long        : 'schema',
            description : 'schema目录',
            value       : true,
            required    : true, 
        },
        { 
            short       : 'r',
            long        : 'router',
            description : 'router目录',
            value       : true,
            required    : true, 
        },
        {
            short       : 't',
            long        : 'type',
            description : '类型：object, relation',
            value       : true,
            required    : true
        }
    ],
    [
        { name : 'module', required: true },
    ], true);

const routerDir = path.resolve(opts.get('router'));
const schemaDir = path.resolve(opts.get('schema'));
const type = opts.get('type');
const rebuilder = new Rebuilder(type, schemaDir, routerDir, opts.args()[0]);

rebuilder.exec().catch(err => {
    console.error(err.stack);
    process.exit(-1);
});