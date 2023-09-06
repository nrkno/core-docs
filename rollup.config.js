import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import copy from 'rollup-plugin-copy'
import postcss from 'rollup-plugin-postcss'
import serve from 'rollup-plugin-serve'

// Workaround until eslint/standard implement import assertions
// https://github.com/eslint/eslint/discussions/15305#discussioncomment-1634740
const packageUrl = new URL('./package.json', import.meta.url)
const pkg = JSON.parse(await readFile(packageUrl, 'utf-8'))

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
  !isBuild &&
    serve({
      contentBase: 'lib',
      headers: { 'X-UA-Compatible': 'IE=edge' },
      port: 10002
    })
]

if (isBuild) {
  for (const fileName of ['readme.md', 'src/readme.md']) {
    const fileUrl = new URL(fileName, import.meta.url)
    const readme = await readFile(fileUrl, 'utf-8')
    await writeFile(fileName, readme.replace(/\/major\/\d+/, `/major/${pkg.version.match(/\d+/)}`))
  }
}

export default [
  {
    input: 'src/index.js', // Minified for browsers
    output: { file: 'lib/core-docs.min.js', format: 'iife', sourcemap: true, banner },
    plugins: plugins.concat(isBuild && terser({ format: { comments: /^!/ } }))
  },
  {
    input: 'src/index.js', // Full source for browsers
    output: { file: 'lib/core-docs.js', format: 'iife', banner },
    plugins
  }
]
