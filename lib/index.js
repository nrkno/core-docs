import 'raf/polyfill' // Fixes React
import 'core-js/es6/map' // Fixes Buble / React
import 'core-js/es6/set' // Fixes Buble / React
import prettifyCss from 'code-prettify/src/prettify.css'
import coreFonts from '@nrk/core-fonts/core-fonts.min.css'
import coreTabs from '@nrk/core-tabs'
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

mark.hr = function () {
  return '<hr aria-hidden="true">'
}

mark.code = function (code, lang) {
  const raw = lang === 'html' ? code.replace(/<!--\s*demo\s*-->\n*/i, '') : code
  const esc = raw.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const pre = '<pre><code>' + window.PR.prettyPrintOne(esc, lang) + '</code></pre>'
  return raw === code ? pre : '<div class="docs-demo">' + raw + '<details><summary>CODE</summary>' + pre + '</details></div>'
}

mark.heading = function (text, level) {
  const id = text.toLowerCase().replace(/\W+/g, '-')
  return `<h${level} id="${id}"><a href="#${id}">${text}</a></h${level}>`
}

function queryAll (selector, context = document) {
  return [].slice.call(typeof selector === 'string' ? context.querySelectorAll(selector) : selector)
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

function onHash () {
  const anchor = document.getElementById(window.location.hash.slice(1))
  if (anchor) {
    queryAll('.docs-tabs > a').forEach((tab) => {
      const panel = document.getElementById(`${tab.id}--panel`)
      const inside = tab === anchor || panel.contains(anchor)
      if (inside) coreTabs(tab.parentElement, tab)
    })
    anchor.scrollIntoView()
    anchor.focus()
  }
}

function generateSubmenu () {
  return `<ul>${queryAll('h2[id]').map((h2) =>
    `<li><a href="#${h2.id}">${h2.textContent}</a></li>`
  ).join('')}</ul>`
}

function generateTabs (html) {
  const groupby = /^(h1|h2|hr)$/i
  const dom = document.createElement('div')
  let tabs

  dom.innerHTML = html
  queryAll(dom.children).forEach((el) => {
    if (el.nodeName.match(groupby)) tabs = null // Break out of group
    if (el.nodeName === 'H4') {
      if (!tabs) dom.insertBefore(tabs = document.createElement('div'), el).className = 'docs-tabs'
      tabs.insertAdjacentHTML('beforeend', `<a id="${el.id}" aria-controls="${el.id}--panel" href="#${el.id}">${el.textContent}</a>`)
      tabs.insertAdjacentHTML('afterend', `<div id="${el.id}--panel" aria-labelledby="${el.id}"></div>`)
      dom.removeChild(el)
    } else if (tabs) {
      tabs.nextElementSibling.appendChild(el)
    }
  })

  return dom.innerHTML
}

if (link) {
  document.title = link.textContent
  window.addEventListener('hashchange', onHash)
  ajax.onload = () => {
    const html = ajax.responseText.replace(/<!--\s*demo\n|\ndemo\s*-->/g, '')
    main.innerHTML = generateTabs(marked(html, { renderer: mark, gfm: true }))
    link.style.fontWeight = 600
    link.insertAdjacentHTML('afterend', generateSubmenu())
    coreTabs('.docs-tabs')
    chooseTransform(transform => exec(queryAll('script', main), transform, onHash))
  }
  ajax.open('GET', `${base}/${file.slice(1)}`, true)
  ajax.send()
} else {
  main.innerHTML = 'Can only load pages from the menu'
}
