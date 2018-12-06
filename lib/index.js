import prettifyCss from 'code-prettify/src/prettify.css'
import coreFonts from '@nrk/core-fonts/lib/core-fonts.css'
import coreCss from '@nrk/core-css/lib/core-css.css'
import docsCss from './index.css'
import marked from 'marked'
import { transform } from 'buble'
import 'code-prettify'
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

// Setup global React
window.React = React
window.ReactDOM = ReactDOM
window.PropTypes = PropTypes

// Polyfill for IE
document.createElement('nav')
document.createElement('main')

const style = queryAll('style').map(style => style.textContent).join('')
const title = document.querySelector('title').innerHTML
const menu = document.querySelector('ul').outerHTML
const head = document.head || document.documentElement.appendChild(document.createElement('head'))
const body = document.body || document.documentElement.appendChild(document.createElement('body'))

head.innerHTML = `
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>${coreFonts}${coreCss}${prettifyCss}${docsCss}${style}</style>
`

body.innerHTML = `
  <nav class="doc-menu">
    <svg style="width:3.5em;height:1.4em" focusable="false" aria-hidden="true"><use xlink:href="#nrk-logo-nrk" /></svg>
    ${menu}
  </nav>
  <main class="doc-main"></main>
`

head.appendChild(document.createElement('script')).src = 'https://static.nrk.no/core-icons/major/3/core-icons.min.js'

const file = window.location.search || document.querySelector('.doc-menu a').search
const link = document.querySelector('.doc-menu a[href*="' + file + '"]')
const main = document.querySelector('.doc-main')
const ajax = new window.XMLHttpRequest()
const mark = new marked.Renderer()

function queryAll (selector, context = document) {
  return [].slice.call(context.querySelectorAll(selector))
}

function code (code, lang) {
  const raw = code.replace(/<!--\s*demo\s*-->\n*/i, '')
  const esc = raw.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const pre = '<pre><code>' + window.PR.prettyPrintOne(esc, lang) + '</code></pre>'
  return raw === code ? pre : '<div class="doc-demo">' + raw + '<details><summary>CODE</summary>' + pre + '</details></div>'
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
      target.appendChild(document.createTextNode(transform(source.textContent, {
        dangerousForOf: true,
        dangerousTaggedTemplateString: true
      }).code))
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
  mark.code = code
  ajax.onload = () => {
    main.innerHTML = marked(ajax.responseText.replace(/<!--\s*demo\n|\ndemo\s*-->/g, ''), {
      renderer: mark,
      gfm: true
    })
    renderSubmenu()
    exec(queryAll('script', main), scrollToHash)
  }
  ajax.open('GET', file.slice(1), true)
  ajax.send()
} else {
  main.innerHTML = 'Can only load pages from the menu'
}
