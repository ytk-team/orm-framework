#!/usr/bin/env node
const opts = require('opts');
const path = require('path');
const Builder = require('./builder');

opts.parse(
    [
        { 
            short       : 'd',
            long        : 'dir',
            description : '定义文件目录',
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

const routerDir = path.resolve(`${opts.get('dir')}/router`);
const schemaDir = path.resolve(`${opts.get('dir')}/schema`);
const type = opts.get('type');
const builder = new Builder(type, schemaDir, routerDir, opts.args()[0]);

builder.exec().catch(err => {
    console.error(err.stack);
    process.exit(-1);
});