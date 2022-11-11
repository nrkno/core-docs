import 'raf/polyfill' // Fixes React
import '@webcomponents/custom-elements' // Polyfill CustomElements
import 'core-js/features/map' // Fixes React
import 'core-js/features/set' // Fixes React
import hljs from 'highlight.js'
import CoreTabs from '@nrk/core-tabs'
import docStyles from './index.scss'
import { marked } from 'marked'
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

hljs.configure(window.coreDocs.hljsOptions)

// Setup globals
window.React = React
window.ReactDOM = ReactDOM
window.PropTypes = PropTypes

// Polyfill for IE
document.createElement('nav')
document.createElement('main')
document.createElement('detail')
document.createElement('summary')

const inlineStyles = queryAll('style').map(style => style.textContent).join('')
const menu = document.querySelector('ul')
const options = (window.coreDocs || {})
const head = document.head || document.documentElement.appendChild(document.createElement('head'))
const body = document.body || document.documentElement.appendChild(document.createElement('body'))
const viewport = document.createElement('meta')
const favicon = document.createElement('link')
const style = document.createElement('style')
const headingCount = {}

viewport.name = 'viewport'
viewport.content = 'width=device-width, initial-scale=1'
favicon.rel = 'icon'
favicon.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAADFBMVEVHcEwAAAAAAAAAAAALttw0AAAABHRSTlMAo072UomwAQAAACtJREFUeAFjwAlCVUNVGf6v/2/H8Dt3fQnD77f8JQyf7/LbMXy8x6+LUxcABsAM/pO2f6gAAAAASUVORK5CYII='

head.appendChild(viewport)
head.appendChild(favicon)

body.innerHTML = `
  <header class="docs-menu">
    <nav>${menu.outerHTML}</nav>
  </header>
  <main class="docs-main"></main>
`

const base = window.location.href.split(/[?#]/)[0].replace(/\/+(\w+\.\w+)?$/, '') // URL without trailing slash
const file = window.location.search || document.querySelector('.docs-menu a').search
const link = document.querySelector('.docs-menu a[href*="' + file + '"]')
const main = document.querySelector('.docs-main')
const ajax = new window.XMLHttpRequest()
const mark = new marked.Renderer()

mark.code = function (code, lang) {
  const raw = lang === 'html' ? code.replace(/<!--\s*demo\s*-->\n*/i, '') : code
  const esc = raw.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const pre = '<pre><code>' + esc + '</code></pre>'
  return raw === code ? pre : '<div class="docs-demo">' + raw + '<details><summary>source</summary>' + pre + '</details></div>'
}
mark.heading = function (text, level) {
  const heading = text.toLowerCase().replace(/\W+/g, '-')
  headingCount[heading] = headingCount[heading] === undefined ? 1 : headingCount[heading] + 1
  const id = headingCount[heading] > 1 ? `${heading}-${headingCount[heading]}` : heading
  return `<h${level} class="docs-heading docs-heading--${level}"><a id="${id}" href="#${id}">${text}</a></h${level}>`
}
mark.hr = () => '<hr class="docs-ruler" aria-hidden="true">'
mark.table = (thead, tbody) => `<table class="docs-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table>`
mark.blockquote = (text) => `<blockquote class="docs-quote">${text}</blockquote>`
mark.paragraph = (text) => `<p class="docs-p">${text}</p>`
mark.list = (body) => `<ul class="docs-list">${body}</ul>`

function queryAll (selector, context = document) {
  return [].slice.call(typeof selector === 'string' ? context.querySelectorAll(selector) : selector)
}

function loadTransform (done) {
  const script = document.createElement('script')
  script.onload = () => done((code) => window.Babel.transform(code, { presets: ['es2015', 'react'] }).code)
  script.src = 'https://unpkg.com/@babel/standalone/babel.min.js'
  script.setAttribute('charset', 'utf-8')
  document.head.appendChild(script)
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
      try {
        target.appendChild(document.createTextNode(transform(source.textContent)))
      } catch (err) {
        console.error(`${err.message} in script:\n${source.textContent}`)
      }
    }
    source.parentNode.replaceChild(target, source) // Replacing html with node causes script eval
    if (!source.src) onload() // Inline script is loaded instantly
    hljs.highlightAll()
  }, 16) // Let parser finish before next script eval
}

function generateSubmenu () {
  return `<ul>${queryAll('.docs-heading--2 a').map((a) =>
    `<li><a href="#${a.id}">${a.textContent}</a></li>`
  ).join('')}</ul>`
}

function generateTabs (html) {
  const groupby = /^(h1|h2|hr)$/i
  const dom = document.createElement('div')
  let group = { id: '' }
  let tabs

  dom.innerHTML = html

  queryAll(dom.children).forEach((el) => {
    if (el.nodeName.match(groupby)) {
      tabs = null // Break out of group
      group = el.querySelector('a') || { id: Date.now().toString(36) }
    }
    if (el.className.indexOf('docs-heading--4') !== -1) {
      const isFirst = !tabs
      const a = el.querySelector('a')
      const uuid = `${group.id}-${a.id}`

      if (isFirst) dom.insertBefore(tabs = document.createElement('core-docs-tabs'), el).className = 'docs-tabs'
      tabs.insertAdjacentHTML('beforeend', `<a for="${uuid}" href="#${uuid}">${a.textContent}</a>`)
      tabs.insertAdjacentHTML('afterend', `<div id="${uuid}"${isFirst ? '' : ' hidden'}></div>`)
      dom.removeChild(el)
    } else if (tabs) {
      tabs.nextElementSibling.appendChild(el)
    }
  })

  return dom.innerHTML
}

function insertThemeSwitch (headerElement) {
  const DEFAULT_THEME_SWITCH_LABEL = 'toggle theme'
  const themeLabel = options.theme.label || DEFAULT_THEME_SWITCH_LABEL
  const themeSwitch = document.createElement('input')
  const themeSwitchLabel = document.createElement('label')
  const lightIcon = document.createElement('span')
  lightIcon.innerHTML = '☼'
  const darkIcon = document.createElement('span')
  darkIcon.innerHTML = '☾'

  themeSwitch.type = 'checkbox'
  themeSwitch.className = 'docs-switch'
  themeSwitch.ariaLabel = themeLabel
  themeSwitchLabel.className = 'docs-switch-label'
  themeSwitchLabel.appendChild(lightIcon)
  themeSwitchLabel.appendChild(themeSwitch)
  themeSwitchLabel.appendChild(darkIcon)

  headerElement.insertAdjacentElement('afterbegin', themeSwitchLabel)
}

function isInViewport (elem) {
  const { top, left, bottom, right } = elem.getBoundingClientRect()
  return top >= 0 && left >= 0 && bottom <= window.innerHeight && right <= window.innerWidth
}

function onHash (event) {
  const anchor = document.getElementById(window.location.hash.slice(1))
  if (anchor) {
    queryAll('.docs-tabs > a').forEach((tab) => {
      const group = tab.parentElement
      const panel = document.getElementById(tab.hash.slice(1))
      const inside = tab === anchor || panel.contains(anchor)
      if (inside) group.tab = tab // Set active tab
    })

    if (!isInViewport(anchor)) anchor.scrollIntoView()
  }
}

function preventScrollOnTabs (event) {
  if (event.metaKey || event.ctrlKey || event.defaultPrevented) return
  for (let el = event.target; el; el = el.parentElement) {
    if (el.hash && el.hasAttribute('aria-controls')) {
      event.preventDefault()
      window.history.pushState({}, document.title, el.href)
    }
  }
}

function renderPage (event) {
  const markdown = event.target.responseText.replace(/<!--\s*demo\n|\ndemo\s*-->/g, '')
  const markdownHtml = marked(markdown, { renderer: mark, gfm: true })
  main.innerHTML = options.tabs === true ? generateTabs(markdownHtml) : markdownHtml
  const htmlElement = document.querySelector('html')

  if (options.theme.enabled) {
    const header = document.querySelector('.docs-menu')
    insertThemeSwitch(header)
    const themeSwitch = header.querySelector('input.docs-switch')
    if (window.matchMedia) {
      // Use system default if present
      const prefersColorSchemeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      themeSwitch.checked = prefersColorSchemeDark
      htmlElement.setAttribute('data-theme', prefersColorSchemeDark ? 'dark' : 'light')

      // Listen to system changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        themeSwitch.checked = event.matches
        htmlElement.setAttribute('data-theme', event.matches ? 'dark' : 'light')
      })
    }
    // React to user input
    themeSwitch.addEventListener('change', event => {
      htmlElement.setAttribute('data-theme', event.target.checked ? 'dark' : 'light')
    })
  }

  link.style.fontWeight = 600
  link.insertAdjacentHTML('afterend', generateSubmenu())
  loadTransform(transform => exec(queryAll('script', main), transform, onHash))
}

if (link) {
  const pageTitle = link.textContent
  const siteTitle = document.querySelector('.docs-menu a').textContent

  window.customElements.define('core-docs-tabs', CoreTabs)
  document.title = pageTitle === siteTitle ? pageTitle : `${pageTitle} - ${siteTitle}`
  document.addEventListener('click', preventScrollOnTabs)
  window.addEventListener('hashchange', onHash)
  ajax.addEventListener('load', renderPage)
  ajax.open('GET', `${base}/${file.slice(1)}`, true)
  ajax.send()
} else {
  main.innerHTML = 'Can only load pages from the menu'
}