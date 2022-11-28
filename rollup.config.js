import fs from 'fs'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import serve from 'rollup-plugin-serve'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'
import copy from 'rollup-plugin-copy'
import path from 'path'
import postcss from 'rollup-plugin-postcss'

const isBuild = !process.env.ROLLUP_WATCH
const banner = `/*! @nrk/core-docs v${pkg.version} - Copyright (c) 2018-${new Date().getFullYear()} NRK */`
const plugins = [
  replace({
    values: { 'process.env.NODE_ENV': JSON.stringify('production') },
    preventAssignment: true
  }),
  {
    name: 'watch-external',
    buildStart () {
      this.addWatchFile(path.resolve('src', 'index.html'))
      this.addWatchFile(path.resolve('src', 'readme.md'))
    }
  },
  copy({
    targets: [
      { src: 'src/index.html', dest: 'lib' },
      { src: 'src/readme.md', dest: 'lib' }
    ]
  }),
  postcss({
    inject: false,
    minimize: true,
    use: ['sass']
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
  for (const file of ['readme.md', 'src/readme.md']) {
    const readme = fs.readFileSync(file, 'utf-8')
    fs.writeFileSync(file, readme.replace(/\/major\/\d+/, `/major/${pkg.version.match(/\d+/)}`))
  }
}

export default [{
  input: 'src/index.js', // Minified for browsers
  output: { file: 'lib/core-docs.min.js', format: 'iife', sourcemap: true, banner },
  plugins: plugins.concat(isBuild && terser({ format: { comments: /^!/ } }))
}, {
  input: 'src/index.js', // Full source for browsers
  output: { file: 'lib/core-docs.js', format: 'iife', banner },
  plugins
}]
