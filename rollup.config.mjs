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

const inputs = [
    'split', 'limit', 'scroll', 'masonry', 'expand', 'carousel', 'slide'
];

export default inputs.map((name) => ({
    input: {
        [name]: `src/${name}.ts`
    },
    output,
    plugins
}));
