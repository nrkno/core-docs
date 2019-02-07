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

const isBuild = !process.env.ROLLUP_WATCH

if (isBuild) {
  const readmes = ['readme.md', path.join('lib', 'readme.md')]
  readmes.map((readme) => [readme, String(fs.readFileSync(readme))]).forEach(([path, readme]) => {
    const versioned = readme.replace(/core-docs\/major\/\d+/, `core-docs/major/${pkg.version.match(/\d+/)}`)
    fs.writeFileSync(path, versioned)
  })
}

const banner = `/*! @nrk/core-docs v${pkg.version} - Copyright (c) 2018-${new Date().getFullYear()} NRK */`
const minify = !isBuild ? [] : uglify({ output: { comments: /^!/ } })
const plugins = [
  replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
  html({ include: 'lib/*.html' }),
  postcss({
    minimize: { preset: 'default', discardUnused: { fontFace: false }, reduceIdents: { keyframes: false } },
    plugins: [autoprefixer({ browsers: ['last 1 version', '> .1%', 'ie 9-11'] })],
    inject: false
  }),
  resolve(),
  commonjs(),
  buble({ transforms: { dangerousForOf: true } }),
  isBuild || serve({
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
