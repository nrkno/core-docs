import autoprefixer from 'autoprefixer'
import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import html from 'rollup-plugin-html'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import serve from 'rollup-plugin-serve'
import { uglify } from 'rollup-plugin-uglify'
import pkg from './package.json'

const banner = `/*! @nrk/core-docs v${pkg.version} - Copyright (c) 2018-${new Date().getFullYear()} NRK */`
const plugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
  html({ include: 'lib/*.html' }),
  postcss({
    minimize: { preset: 'default' },
    plugins: [autoprefixer({ browsers: '> 0.1%' })],
    inject: false
  }),
  resolve({ browser: true }),
  commonjs({
    exclude: ['node_modules/buble/**']
  }),
  buble({
    transforms: { dangerousForOf: true, dangerousTaggedTemplateString: true }
  }),
  !process.env.ROLLUP_WATCH || serve('lib')
]

export default [{
  input: 'lib/index.js', // Minified for browsers
  output: { file: 'lib/core-docs.min.js', format: 'iife', sourcemap: true, banner },
  plugins: plugins.concat(uglify({ output: { comments: /^!/ } }))
}, {
  input: 'lib/index.js', // Full source for browsers
  output: { file: 'lib/core-docs.js', format: 'iife', sourcemap: true, banner },
  plugins
}]
