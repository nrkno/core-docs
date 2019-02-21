import 'raf/polyfill' // Fixes React
import 'core-js/es6/map' // Fixes Buble / React
import 'core-js/es6/set' // Fixes Buble / React
import prettifyCss from 'code-prettify/src/prettify.css'
import coreFonts from '@nrk/core-fonts/core-fonts.min.css'
import docsCss from './index.css'
import marked from 'marked'
import { nrkLogoNrk } from '@nrk/core-icons'
import { transform } from 'buble'

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
document.createElement('detail')
document.createElement('summary')

const styles = queryAll('style').map(style => style.textContent).join('')
const menu = document.querySelector('ul').outerHTML
const head = document.head || document.documentElement.appendChild(document.createElement('head'))
const body = document.body || document.documentElement.appendChild(document.createElement('body'))
const viewport = document.createElement('meta')
const favicon = document.createElement('link')
const style = document.createElement('style')

viewport.name = 'viewport'
viewport.content = 'width=device-width, initial-scale=1'
favicon.rel = 'icon'
favicon.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAADFBMVEVHcEwAAAAAAAAAAAALttw0AAAABHRSTlMAo072UomwAQAAACtJREFUeAFjwAlCVUNVGf6v/2/H8Dt3fQnD77f8JQyf7/LbMXy8x6+LUxcABsAM/pO2f6gAAAAASUVORK5CYII='
style.textContent = `${coreFonts}${prettifyCss}${docsCss}${styles}`

head.appendChild(viewport)
head.appendChild(favicon)
head.appendChild(style)

body.innerHTML = `
  <a class="docs-logo" href="https://github.com/nrkno/">${nrkLogoNrk}</a>
  <nav class="docs-menu">${menu}</nav>
  <main class="docs-main"></main>
`

const base = window.location.href.split(/[?#]/)[0].replace(/\/+(\w+\.\w+)?$/, '') // URL without trailing slash
const file = window.location.search || document.querySelector('.docs-menu a').search
const link = document.querySelector('.docs-menu a[href*="' + file + '"]')
const main = document.querySelector('.docs-main')
const ajax = new window.XMLHttpRequest()
const mark = new marked.Renderer()

function queryAll (selector, context = document) {
  return [].slice.call(context.querySelectorAll(selector))
}

function markCode (code, lang) {
  const raw = lang === 'html' ? code.replace(/<!--\s*demo\s*-->\n*/i, '') : code
  const esc = raw.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const pre = '<pre><code>' + window.PR.prettyPrintOne(esc, lang) + '</code></pre>'
  return raw === code ? pre : '<div class="docs-demo">' + raw + '<details><summary>CODE</summary>' + pre + '</details></div>'
}

function markHeading (text, level) {
    const id = text.toLowerCase().replace(/\W+/g, '-')
    return `<h${level} id="${id}"><a href="#${id}">${text}</a></h${level}></a>`
}

function chooseTransform (done) {
  try {
    transform('Object.assign({a:1}, {b:2})')
    done((code) => transform(code, { objectAssign: 'Object.assign' }).code)
  } catch (err) { /* use babel when buble fails in IE  */
    const script = document.createElement('script')
    script.onload = () => done((code) => window.Babel.transform(code, { presets: ['es2015', 'react'] }).code)
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js'
    script.setAttribute('charset', 'utf-8')
    document.head.appendChild(script)
  }
}

function exec (scripts, transform, callback) {
  setTimeout(() => {
    const source = scripts.shift()
    const target = document.createElement('script')
    const onload = () => exec(scripts, transform, callback)
    target.setAttribute('charset', 'utf-8')

    if (!source) return callback && callback()
    else if (source.src) {
      target.src = source.src
      target.onload = onload
    } else {
      target.appendChild(document.createTextNode(transform(source.textContent)))
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
  mark.code = markCode
  mark.heading = markHeading
  ajax.onload = () => {
    main.innerHTML = marked(ajax.responseText.replace(/<!--\s*demo\n|\ndemo\s*-->/g, ''), {
      renderer: mark,
      gfm: true
    }).replace(/<hr[^>]*>/g, '<hr aria-hidden="true">')
    renderSubmenu()
    chooseTransform(transform => {
      exec(queryAll('script', main), transform, scrollToHash)
    })
  }
  ajax.open('GET', `${base}/${file.slice(1)}`, true)
  ajax.send()
} else {
  main.innerHTML = 'Can only load pages from the menu'
}
