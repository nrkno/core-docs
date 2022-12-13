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
import styles from './index.scss'

const SESSION_STORAGE_SELECTED_THEME_KEY = 'docs-theme-user-state'
const DEFAULT_THEME_TOGGLE_LABEL = 'Toggle color theme'

/**
 * @typedef {object} themeOptions
 * @property {boolean} prefers Used to turn off check for `prefers-color-scheme: dark`
 * @property {string} label Label for theme-toggle
 */

/**
 * @typedef {object} coreScrollOptions
 * @property {boolean} tabs Turn on tabs functionality
 * @property {themeOptions | boolean} theme Turn on and/or adjust theme functionality
 */

/**
 * Reference settings for core-docs. Used when nothing is specified in `window.coreDocs`
 * @type {coreScrollOptions}
 */
const defaultOptions = {
  tabs: false,
  theme: false
}

/**
 * Options defined in window.coreDocs or with fallback to defaultOptions
 * @type {coreScrollOptions}
 */
const configuredOptions = (window && window.coreDocs) || defaultOptions

/**
 * Reference settings for theme, used when configuredOptions contains `true` for `theme`
 * @type {themeOptions}
 */
const defaultThemeOptions = {
  prefers: true,
  label: DEFAULT_THEME_TOGGLE_LABEL
}

const isBoolean = val => typeof val === 'boolean'

const resolveOptions = () => ({
  tabs: isBoolean(configuredOptions.tabs)
    ? configuredOptions.tabs
    : defaultOptions.tabs,
  theme: (configuredOptions.theme
    ? Object.assign(
      defaultThemeOptions,
      isBoolean(configuredOptions.theme) ? {} : configuredOptions.theme
    )
    : defaultOptions.theme)
})

/**
 * @type {coreScrollOptions}
 */
const options = resolveOptions()

/*
Sets theme state early to avoid light mode flicker in dark mode.
*/
if (options.theme) {
  const selectedTheme = window.sessionStorage.getItem(SESSION_STORAGE_SELECTED_THEME_KEY)
  if (selectedTheme) {
    // user has toggled theme for this session
    document.documentElement.setAttribute('data-theme', selectedTheme)
  } else {
    // current system settings
    if (options.theme.prefers && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }
}

// Setup globals
window.React = React
window.ReactDOM = ReactDOM
window.PropTypes = PropTypes

// Polyfill for IE
document.createElement('nav')
document.createElement('main')
document.createElement('detail')
document.createElement('summary')

const menu = document.querySelector('ul')
const head = document.head || document.documentElement.appendChild(document.createElement('head'))
const body = document.body || document.documentElement.appendChild(document.createElement('body'))
const viewport = document.createElement('meta')
const headingCount = {}

viewport.name = 'viewport'
viewport.content = 'width=device-width, initial-scale=1'

head.appendChild(viewport)

const stripDemoFlag = (html) => html.replace(/<!--\s*demo\s*-->\n*/i, '')
let parseHtml = (html) => stripDemoFlag(html)
let themeToggle = ''

if (options.theme) {
  const isDarkMode = () => document.documentElement.getAttribute('data-theme') === 'dark'
  themeToggle = `
    <label class="docs-toggle-label" aria-label="${options.theme.label || DEFAULT_THEME_TOGGLE_LABEL}">
      <div class="docs-toggle-wrapper">
        <input type="checkbox" class="docs-toggle" id="core-docs-theme-toggle" ${isDarkMode ? 'checked' : ''}>
      </div>
    </label>
  `
  // Resolve custom core-docs html conditons based on current theme, e.g: class="{{ 'light' : 'dark' }}"
  const resolveThemeConditions = (html) => {
    const themeClassConditionRegex = /(?<condition>{{\s*['"](?<light>-?[_a-zA-Z\s]+[_a-zA-Z0-9-\s]*)['"]\s*:\s*['"](?<dark>-?[_a-zA-Z\s]+[_a-zA-Z0-9-\s]*)['"]\s*}})/ig
    return html.replaceAll(themeClassConditionRegex, (classCondition) => classCondition.replace(themeClassConditionRegex, isDarkMode() ? '$<dark>' : '$<light>'))
  }

  // Inject theme resolve into parseHtml
  parseHtml = (html) => resolveThemeConditions(stripDemoFlag(html))
}

body.innerHTML = `
  ${themeToggle}
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

const style = document.createElement('style')
style.textContent = styles
style.title = 'Core Docs'
head.appendChild(style)

mark.code = (raw, lang) => {
  const applyHighlighting = (code, lang) => `<pre class="docs-code"><code>${(hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang }) : hljs.highlightAuto(code)).value}</code></pre>`
  const applyDemoBlock = (code, highlighted) => '<div class="docs-demo">' + code + '<details><summary>source</summary>' + highlighted + '</details></div>'
  switch (lang) {
    case 'html': {
      const code = parseHtml(raw)
      return code === raw
        ? applyHighlighting(code, lang)
        : applyDemoBlock(code, applyHighlighting(code, lang))
    }
    case 'mermaid':
      return '<div class="mermaid">' + raw + '</div>'
    default:
      return applyHighlighting(raw, lang)
  }
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
mark.html = (raw) => parseHtml(raw)

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
  if (options.theme) {
    // const header = document.querySelector('.docs-menu')
    const themeToggle = body.querySelector('input#core-docs-theme-toggle')

    const sessionThemeSelection = window.sessionStorage.getItem(SESSION_STORAGE_SELECTED_THEME_KEY)
    if (['dark', 'light'].includes(sessionThemeSelection)) {
      const sessionThemeStatus = sessionThemeSelection === 'dark'
      // Theme status from session and toggle element are not in sync
      if (!themeToggle.checked === sessionThemeStatus) {
        themeToggle.checked = sessionThemeStatus
      }
    } else if (window.matchMedia) {
      const isSystemSchemeDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches
      themeToggle.checked = isSystemSchemeDark()
      // Listen to system changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
        themeToggle.checked = matches
        document.documentElement.setAttribute('data-theme', matches ? 'dark' : 'light')
      })
    }
    // React to user input
    themeToggle.addEventListener('change', ({ target }) => {
      document.documentElement.setAttribute('data-theme', target.checked ? 'dark' : 'light')
      window.sessionStorage.setItem(SESSION_STORAGE_SELECTED_THEME_KEY, target.checked ? 'dark' : 'light')
      window.location.reload(false)
    })
  }
  renderMarkdown(event.target.responseText)

  link.style.fontWeight = 600
  link.insertAdjacentHTML('afterend', generateSubmenu())
  loadTransform(transform => exec(queryAll('script', main), transform, onHash))
}

if (link) {
  const pageTitle = link.textContent
  const siteTitle = document.querySelector('.docs-menu a').textContent
  if (!window.customElements.get('core-docs-tabs')) {
    window.customElements.define('core-docs-tabs', CoreTabs)
  }
  document.title = pageTitle === siteTitle ? pageTitle : `${pageTitle} - ${siteTitle}`
  document.addEventListener('click', preventScrollOnTabs)
  window.addEventListener('hashchange', onHash)
  ajax.addEventListener('load', renderPage)
  ajax.open('GET', `${base}/${file.slice(1)}`, true)
  ajax.send()
} else {
  main.innerHTML = 'Can only load pages from the menu'
}
