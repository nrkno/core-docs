import 'raf/polyfill' // Fixes React
import 'core-js/es6/map' // Fixes Buble / React
import 'core-js/es6/set' // Fixes Buble / React
import prettifyCss from 'code-prettify/src/prettify.css'
import coreCss from '@nrk/core-css/lib/core-css.css'
import docsCss from './index.css'
import marked from 'marked'
import * as Buble from 'buble'

import 'code-prettify'
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

// Setup globals
window.React = React
window.ReactDOM = ReactDOM
window.PropTypes = PropTypes

// Polyfill for IE
document.createElement('nav')
document.createElement('main')

const style = queryAll('style').map(style => style.textContent).join('')
const menu = document.querySelector('ul').outerHTML
const head = document.head || document.documentElement.appendChild(document.createElement('head'))
const body = document.body || document.documentElement.appendChild(document.createElement('body'))
const metaViewport = document.createElement('meta')
const linkFavicon = document.createElement('link')
const linkFonts = document.createElement('link')
const styles = document.createElement('style')

metaViewport.name = 'viewport'
metaViewport.content = 'width=device-width, initial-scale=1'
linkFavicon.rel = 'icon'
linkFavicon.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAADFBMVEVHcEwAAAAAAAAAAAALttw0AAAABHRSTlMAo072UomwAQAAACtJREFUeAFjwAlCVUNVGf6v/2/H8Dt3fQnD77f8JQyf7/LbMXy8x6+LUxcABsAM/pO2f6gAAAAASUVORK5CYII='
linkFonts.rel = 'stylesheet'
linkFonts.href = 'https://static.nrk.no/core-fonts/major/2/core-fonts.min.css'
styles.textContent = `${coreCss}${prettifyCss}${docsCss}${style}`

body.innerHTML = `
  <nav class="docs-menu">
    <svg class="docs-logo" style="width:3.5em;height:1.4em" focusable="false" aria-hidden="true">
      <use xlink:href="#nrk-logo-nrk" />
    </svg>
    ${menu}
  </nav>
  <main class="docs-main"></main>
`

head.appendChild(metaViewport)
head.appendChild(linkFavicon)
head.appendChild(linkFonts)
head.appendChild(styles)
head.appendChild(document.createElement('script')).src = 'https://static.nrk.no/core-icons/major/3/core-icons.min.js'

const file = window.location.search || document.querySelector('.docs-menu a').search
const link = document.querySelector('.docs-menu a[href*="' + file + '"]')
const main = document.querySelector('.docs-main')
const ajax = new window.XMLHttpRequest()
const mark = new marked.Renderer()

function queryAll (selector, context = document) {
  return [].slice.call(context.querySelectorAll(selector))
}

function code (code, lang) {
  const literal = code.match(/(^```|```$)/g) || []
  const raw = literal.length === 2 ? code : code.replace(/<!--\s*demo\s*-->\n*/i, '') /* skip replace for literal <!--demo--> */
  const esc = raw.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const pre = '<pre><code>' + window.PR.prettyPrintOne(esc, lang) + '</code></pre>'
  return raw === code ? pre : '<div class="docs-demo">' + raw + '<details><summary>CODE</summary>' + pre + '</details></div>'
}

function chooseTransform (callback) {
  try {
    Buble.transform('123')
    callback(Buble.transform)
  } catch (err) { /* use babel when buble fails in ie  */
    const script = document.createElement('script')
    script.onload = () => callback(Babel.transform)
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js'
    document.head.appendChild(script)
  }
}

function exec (scripts, callback) {
  setTimeout(() => {
    const source = scripts.shift()
    const target = document.createElement('script')
    const onload = () => exec(scripts, callback)

    if (!source) return callback && callback()
    else if (source.src) {
      target.src = source.src
      target.onload = onload
    } else {
      chooseTransform(transform => {
        const code = transform(source.textContent, { presets: ['es2015', 'react'] }).code
        target.appendChild(document.createTextNode(code))
      })
    }
    source.parentNode.replaceChild(target, source) // Replacing html with node causes script eval
    if (!source.src) onload() // Inline script is loaded instantly
  }, 16) // Let parser finish before next script eval
}

function scrollToHash () {
  const scrollTo = document.getElementById(window.location.hash.slice(1))
  if (scrollTo) {
    scrollTo.scrollIntoView()
    scrollTo.focus()
  }
}

function renderSubmenu () {
  link.style.fontWeight = 600
  link.insertAdjacentHTML('afterend', `<ul>${queryAll('h2[id]').map(h2 =>
    `<li>${h2.outerHTML.replace('id="', 'href="#').replace(/h2/g, 'a')}</li>`
  ).join('')}</ul>`)
}

if (link) {
  document.title = link.textContent
  mark.code = code
  ajax.onload = () => {
    main.innerHTML = marked(ajax.responseText.replace(/<!--\s*demo\n|\ndemo\s*-->/g, ''), {
      renderer: mark,
      gfm: true
    }).replace(/<hr[^>]*>/g, '<hr aria-hidden="true">')
    renderSubmenu()
    exec(queryAll('script', main), scrollToHash)
  }
  ajax.open('GET', file.slice(1), true)
  ajax.send()
} else {
  main.innerHTML = 'Can only load pages from the menu'
}
