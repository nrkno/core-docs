import 'raf/polyfill' // Fixes React
import '@webcomponents/custom-elements' // Polyfill CustomElements
import 'core-js/features/map' // Fixes React
import 'core-js/features/set' // Fixes React
import hljs from 'highlight.js/lib/common'
import CoreTabs from '@nrk/core-tabs'
import { marked } from 'marked'
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

hljs.configure(window.coreDocs.hljsOptions)

const SESSION_STORAGE_SELECTED_THEME_KEY = 'theme-user-state'

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

const isDarkMode = () => document.documentElement.getAttribute('data-theme') === 'dark'

mark.code = function (code, lang) {
  const raw = lang === 'html' ? code.replace(/<!--\s*demo\s*-->\n*/i, '') : code
  const themeClassConditionRegex = /(?<condition>{{\s*'(?<light>-?[_a-zA-Z\s]+[_a-zA-Z0-9-\s]*)'\s*:\s*'(?<dark>-?[_a-zA-Z\s]+[_a-zA-Z0-9-\s]*)'\s*}})/ig
  const rawWithTheme = raw.replaceAll(themeClassConditionRegex, (classCondition) => classCondition.replace(themeClassConditionRegex, isDarkMode() ? '$<dark>' : '$<light>'))
  const highlighted = (lang ? hljs.highlight(rawWithTheme, { language: lang }) : hljs.highlightAuto(rawWithTheme)).value
  const pre = '<pre class="docs-code"><code>' + highlighted + '</code></pre>'
  return raw === code ? pre : '<div class="docs-demo">' + rawWithTheme + '<details><summary>source</summary>' + pre + '</details></div>'
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
mark.codespan = (text) => `<code class="docs-codespan">${text}</code>`

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
  themeSwitch.id = 'core-docs-theme-switch'
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

function renderMarkdown (raw) {
  const markdown = raw.replace(/<!--\s*demo\n|\ndemo\s*-->/g, '')
  const markdownHtml = marked(markdown, { renderer: mark, gfm: true })
  main.innerHTML = options.tabs === true ? generateTabs(markdownHtml) : markdownHtml
}

function renderPage (event) {
  renderMarkdown(event.target.responseText)

  if (options.theme.enabled) {
    const header = document.querySelector('.docs-menu')
    insertThemeSwitch(header)
    const themeSwitch = header.querySelector('input.docs-switch')
    if (window.matchMedia) {
      // Use system default if present
      const isSystemSchemeDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches
      const isSelectedSchemeDark = () => window.sessionStorage.getItem(SESSION_STORAGE_SELECTED_THEME_KEY) === 'dark'
      themeSwitch.checked = isSelectedSchemeDark() || isSystemSchemeDark()

      // Listen to system changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
        themeSwitch.checked = matches
        document.documentElement.setAttribute('data-theme', matches ? 'dark' : 'light')
      })
    }
    // React to user input
    themeSwitch.addEventListener('change', ({ target }) => {
      document.documentElement.setAttribute('data-theme', target.checked ? 'dark' : 'light')
      window.sessionStorage.setItem(SESSION_STORAGE_SELECTED_THEME_KEY, target.checked ? 'dark' : 'light')
      renderMarkdown(event.target.responseText)
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
