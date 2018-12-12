import autoprefixer from 'autoprefixer'
import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import html from 'rollup-plugin-html'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import serve from 'rollup-plugin-serve'
import { uglify } from 'rollup-plugin-uglify'
import path from 'path'
import fs from 'fs'
import pkg from './package.json'

if (!process.env.ROLLUP_WATCH) {
  const readme = String(fs.readFileSync(path.join('lib', 'readme.md')))
  const versioned = readme.replace(/\/major\/\d+/, `/major/${pkg.version.match(/\d+/)}`)
  fs.writeFileSync(path.join('lib', 'readme.md'), versioned)
}

const banner = `/*! @nrk/core-docs v${pkg.version} - Copyright (c) 2018-${new Date().getFullYear()} NRK */`
const minify = process.env.ROLLUP_WATCH ? [] : uglify({ output: { comments: /^!/ } })
const plugins = [
  replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
  html({ include: 'lib/*.html' }),
  postcss({
    minimize: { preset: 'default' },
    plugins: [autoprefixer({ browsers: ['last 1 version', '> .1%', 'ie 9-11'] })],
    inject: false
  }),
  resolve(),
  commonjs(),
  buble({ transforms: { dangerousForOf: true } }),
  !process.env.ROLLUP_WATCH || serve({
    contentBase: 'lib',
    headers: { 'X-UA-Compatible': 'IE=edge' }
  })
]

export default [{
  input: 'lib/index.js', // Minified for browsers
  output: { file: 'lib/core-docs.min.js', format: 'iife', sourcemap: true, banner },
  plugins: plugins.concat(minify)
}, {
  input: 'lib/index.js', // Full source for browsers
  output: { file: 'lib/core-docs.js', format: 'iife', banner },
  plugins
}]
