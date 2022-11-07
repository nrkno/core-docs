# Core Docs

> `@nrk/core-docs` makes it easy to write documentation for your project in [markdown](https://github.com/markedjs/marked) and
> render it beautifully.

## Getting started

Core Docs can parse and render all [markdown](https://github.com/markedjs/marked) files you put in your directory. The only requirement, is a `index.html` which declares the menu as a `<ul>` and loads `@nrk/core-docs`. Link to your markdown files using their relative path, prepended with `?`. Example:

```html
<!DOCTYPE html>
<ul>
  <li><a href="?readme.md">Core Docs</a></li>
  <li><a href="?example/readme.md">Nested</a></li>
  <li><a href="?example/thing.md">More Docs</a></li>
  <li><br /><a href="https://github.com/nrkno/core-docs">View on Github</a></li>
  <li><a href="https://github.com/nrkno/core-docs/releases">View changelog</a></li>
  <li><a href="#" download>Download example</a></li>
</ul>
<script src="https://static.nrk.no/core-docs/major/2/core-docs.min.js" charset="utf-8"></script>
```

### Example structure

```
├── example
│   ├── readme.md
│   └── thing.md
├── index.html
└── readme.md
```

### External links

Add links to code repo, changelog and other useful places for your project to make the documentation a central go-to place for your project.
Links containing `github.com` will get a GitHub icon and links with the `download` attribute will get a download icon.

## Syntax highlighting

Your markdown code can be automatically highlighted by prefixing code blocks with the language extension,
like we do with <code>```html</code>. The docs uses [hljs (highlight.js)](https://highlightjs.org) under the hood.
Language detection and other options can be configured by setting `window.coreDocs.hljsOptions` in the
[same fashion](https://highlightjs.readthedocs.io/en/latest/api.html#configure) originally supported by hljs.
See list of [supported languages](https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md).

For instance you write:

````
```html
<ul>
  <li><button>Chrome</button></li>
  <li><button>Firefox</button></li>
  <li><button>Opera</button></li>
  <li><button>Safari</button></li>
  <li><button>Microsoft Edge</button></li>
</ul>
````

to get HTML highlighting colors:

```html
<ul>
  <li><button>Chrome</button></li>
  <li><button>Firefox</button></li>
  <li><button>Opera</button></li>
  <li><button>Safari</button></li>
  <li><button>Microsoft Edge</button></li>
</ul>
```

## Demos

You can write an inline demo in your markdown by prepending
your `html` code block with `<!-- demo -->`. Demos supports HTML, CSS and JavaScript (ES5, ES6 and JSX) all the way back to IE9!
Example:

```
<!-- demo -->
<style>
  #press-button { padding: .3em; font-size: inherit; }
</style>
<button id="press-button">Press me</button>
<script>
  document.addEventListener('click', event => {
    if (event.target.id === 'press-button')
      alert('You pressed me')
  })
</script>
```

becomes:

```html
<!-- demo -->
<style>
  #press-button {
    padding: 0.3em;
    font-size: inherit;
  }
</style>
<button id="press-button">Press me</button>
<script>
  document.addEventListener('click', event => {
    if (event.target.id === 'press-button') alert('You pressed me')
  })
</script>
```

## Tabs

To render all `<h4>` headings as tabs, set the `tabs` option to `true` in the `index.html` containing the menu:

```html
<ul>
  ...
</ul>
<script>
  window.coreDocs = {
    tabs: true, // Enable automatic tabs
  }
</script>
<script src="https://static.nrk.no/core-docs/latest/core-docs.min.js" charset="utf-8"></script>
```

All level 4 headings are then automatically converted to tabs. Content after a heading level 4 will be put in the correlating tab panel, unless it is a heading level 1, heading level 2, horizontal ruler, or new heading level 4. For example this:

```md
#### Introduction

This is the introduction. It contains some text.

#### Details

Here are the details.

### More

More details

#### Last

The end
```

becomes:

#### Introduction

This is the introduction. It contains some text.

#### Details

Here are the details.

### More

More details

#### Last

The end

## Theme

To turn on dark mode theme, set the `theme` option to `true` in the `index.html` containing the menu:

```html
<ul>
  ...
</ul>
<script>
  window.coreDocs = {
    theme: true, // Enable themes for dark mode support
    themeLabel: 'Mørkt tema', // Override default theme toggle label
  }
</script>
<script src="https://static.nrk.no/core-docs/latest/core-docs.min.js" charset="utf-8"></script>
```

The following CSS custom properties may be used to control themes:

```CSS
/* Default light theme */
body {...}
/* Core docs dark-mode */
body.docs-dark-mode {
  --docs-color-background: #36363b; /* NRK Gray 800 */
  --docs-color-background-code: #1d1d21; /* NRK Gray 900 */
  --docs-color-text: #f7f4f2; /* NRK Gray 50 */
  --docs-color-link: #b2cff5; /* NRK Core Blue 200 */
  --docs-color-border: hsla(210, 15%, 50%, 0.4); /* Origo shade 2 */
  --docs-color-shadow: hsla(210, 15%, 50%, 0.4); /* Origo shade 2 */

  /* Dark theme for prettify.js */
  --docs-prettify-color-plaintext: #ebe7e6; /* NRK Gray 100 */
  --docs-prettify-color-string: #ffea05; /* NRK Yellow 400 */
  --docs-prettify-color-keyword: #efb4ed; /* NRK Cool Pink 200 */
  --docs-prettify-color-comment: #fec864; /* NRK Cool Orange 300 */
  --docs-prettify-color-typename: #efb4ed; /* NRK Cool Pink 200 */
  --docs-prettify-color-literal: #9951ea; /* NRK Purple 500 */
  --docs-prettify-color-punctuation: #00d5e9; /* NRK Cool Mint 300 */
  --docs-prettify-color-tag: #efb4ed; /* NRK Cool Pink 200 */
  --docs-prettify-color-attributename: #83d499; /* NRK Cool Green 300 */
  --docs-prettify-color-attributevalue: #ffea05; /* NRK Yellow 400 */
  --docs-prettify-color-declaration: #efb4ed; /* NRK Cool Pink 200 */
  --docs-prettify-color-function: #ff7461; /* NRK Red 400 */

  --docs-prettify-color-prettyprint--background: #282a36;
  --docs-prettify-color-prettyprint--border: #888;
  --docs-prettify-color-lineshading: #fec864; /* NRK Cool Orange 300 */

  --docs-prettify-print-color-string: #ffea05; /* NRK Yellow 400 */
  --docs-prettify-print-color-keyword: #efb4ed; /* NRK Cool Pink 200 */
  --docs-prettify-print-color-comment: #fec864; /* NRK Cool Orange 300 */
  --docs-prettify-print-color-typename: #efb4ed; /* NRK Cool Pink 200 */
  --docs-prettify-print-color-literal: #9951ea; /* NRK Purple 500 */
  --docs-prettify-print-color-punctuation: #00d5e9; /* NRK Cool Mint 300 */
  --docs-prettify-print-color-tag: #efb4ed; /* NRK Cool Pink 200 */
  --docs-prettify-print-color-attributename: #83d499; /* NRK Cool Green 300 */
  --docs-prettify-print-color-attributevalue: #ffea05; /* NRK Yellow 400 */
}
```

## React

You can also use React to render demos out of the box.

<script src="https://static.nrk.no/core-components/latest/core-toggle/core-toggle.jsx.js"></script>

```html
<!--demo-->
<div id="jsx-toggle-default"></div>
<script type="text/javascript">
  ReactDOM.render(
    <>
      <button>Toggle JSX</button>
      <CoreToggle hidden onToggle={console.log}>
        Content
      </CoreToggle>
    </>,
    document.getElementById('jsx-toggle-default')
  )
</script>
```
