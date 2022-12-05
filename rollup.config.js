import fs from 'fs'
import autoprefixer from 'autoprefixer'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import serve from 'rollup-plugin-serve'
import terser from '@rollup/plugin-terser'
import pkg from './package.json'

const isBuild = !process.env.ROLLUP_WATCH
const banner = `/*! @nrk/core-docs v${pkg.version} - Copyright (c) 2018-${new Date().getFullYear()} NRK */`
const plugins = [
  replace({
    values: { 'process.env.NODE_ENV': JSON.stringify('production') },
    preventAssignment: true
  }),
  postcss({
    plugins: [autoprefixer()],
    inject: false,
    minimize: {
      preset: 'default',
      discardUnused: { fontFace: false },
      reduceIdents: { keyframes: false }
    }
  }),
  resolve(),
  commonjs(),
  babel({
    presets: [['@babel/preset-env', { modules: false }]],
    babelHelpers: 'bundled'
  }),
  !isBuild && serve({
    contentBase: 'lib',
    headers: { 'X-UA-Compatible': 'IE=edge' },
    port: 10002
  })
]

if (isBuild) {
  for (const file of ['readme.md', 'lib/readme.md']) {
    const readme = fs.readFileSync(file, 'utf-8')
    fs.writeFileSync(file, readme.replace(/\/major\/\d+/, `/major/${pkg.version.match(/\d+/)}`))
  }
}

export default [{
  input: 'lib/index.js', // Minified for browsers
  output: { file: 'lib/core-docs.min.js', format: 'iife', sourcemap: true, banner },
  plugins: plugins.concat(isBuild && terser({ format: { comments: /^!/ } }))
}, {
  input: 'lib/index.js', // Full source for browsers
  output: { file: 'lib/core-docs.js', format: 'iife', banner },
  plugins
}]
