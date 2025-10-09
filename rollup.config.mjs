import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import cleaner from 'rollup-plugin-cleaner';
import json from './package.json' with { type: 'json' };

const banner = `/*
* EffSZ v${json.version}
* {@link ${json.repository.url}}
* Copyright (c) Marat Sabitov
* @license ${json.license}
*/`;

const output =  {
    dir: 'dist',
    banner,
    format: 'es',
    plugins: [
        terser(),
    ]
};
const tsPlugin = typescript({
    tsconfig: 'tsconfig.json'
});
const plugins = [
    tsPlugin
];

export default [
    {
        input: {
            split: 'src/split.ts'
        },
        output,
        plugins
    },
    {
        input: {
            limit: 'src/limit.ts'
        },
        output,
        plugins
    },
    {
        input: {
            scroll: 'src/scroll.ts'
        },
        output,
        plugins
    }
];
