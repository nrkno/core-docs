import coreFonts from '@nrk/core-fonts/lib/core-fonts.css'
import coreCss from '@nrk/core-css/lib/core-css.css'
import prettifyCss from 'code-prettify/src/prettify.css'
import docsCss from './index.css'
import marked from 'marked'
import 'code-prettify'
import React from 'react'
import ReactDOM from 'react-dom'
import { transform } from 'buble'
window.React = React
window.ReactDOM = ReactDOM

document.addEventListener('DOMContentLoaded', () => {
  const title = document.querySelector('title').innerHTML
  const style = [].map.call(document.querySelectorAll('style'), style => style.textContent).join('')
  const menu = document.querySelector('ul').outerHTML
  const head = document.head || document.documentElement.appendChild(document.createElement('head'))
  const body = document.body || document.documentElement.appendChild(document.createElement('body'))
  document.createElement('main') // Polyfill for IE

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

  const file = location.search || document.querySelector('.doc-menu a').search
  const link = document.querySelector('.doc-menu a[href*="' + file + '"]')
  const main = document.querySelector('.doc-main')
  const ajax = new XMLHttpRequest()
  const mark = new marked.Renderer()

  function code (code, lang) {
    const raw = code.replace(/<!--\s*demo\s*-->\n*/i, '')
    const esc = raw.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const pre = '<pre><code>' + PR.prettyPrintOne(esc, lang) + '</code></pre>'
    return raw === code ? pre : '<div class="doc-demo">' + raw + '<details><summary>CODE</summary>' + pre + '</details></div>'
  }

  function exec (scripts, callback) {
    setTimeout(() => {
      const source = scripts[0]
      const target = document.createElement('script')
      const onload = () => { exec([].slice.call(scripts, 1), callback) }

      console.log(scripts)
      if (!source) return callback && callback()
      else if (source.src) target.src = source.src, target.onload = onload
      else target.appendChild(document.createTextNode(transform(source.textContent).code))
      source.parentNode.replaceChild(target, source) // Replacing html with node causes script eval
      if (!source.src) onload() // Inline script is loaded instantly
    }, 16) // Let parser finish before next script eval
  }

  mark.code = code
  ajax.onload = () => {
    main.innerHTML = marked(ajax.responseText, { renderer: mark, gfm: true })
    console.log(main.innerHTML)
    exec(main.querySelectorAll('script'), link && function () {
      var toc = [].slice.call(document.querySelectorAll('h2[id]'), 1) // Skip first h2
      link.style.fontWeight = 600
      link.insertAdjacentHTML('afterend', '<ul><li>' + toc.map(h2 => {
        if (h2.id === location.hash.slice(1)) h2.scrollIntoView(), h2.focus() // Scroll to hash
        return h2.outerHTML.replace('id="', 'href="#').replace(/h2/g, 'a') // Swap h2 to a
      }).join('</li><li>') + '</li></ul>')
    })
  }
  ajax.open('GET', file.slice(1), true)
  ajax.send()
})
