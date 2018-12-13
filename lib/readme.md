# Core Docs

> `@nrk/core-docs` makes it easy to write documentation for your project in [markdown](https://github.com/markedjs/marked) and
render it beautifully.

## Getting started

`@nrk/core-docs` can parse and render all [markdown](https://github.com/markedjs/marked) files you put in your repository. The only requirement, is a `index.html` which declares the menu as a `<ul>` and loads `@nrk/core-docs`. Link to your markdown files using their relative path, prepended with `?`. Example:

```html
<!doctype html>
<ul>
  <li><a href="?readme.md">Core Docs</a></li>
  <li><a href="?example/readme.md">Nested</a></li>
  <li><a href="?example/thing.md">More Docs</a></li>
  <li><br><a href="https://github.com/nrkno/core-docs">View on Github</a></li>
  <li><a href="https://github.com/nrkno/core-docs/releases">View changelog</a></li>
  <li><a href="#" download>Download example</a></li>
</ul>
<script src="https://static.nrk.no/core-docs/major/1/core-docs.min.js" charset="utf-8" defer></script>
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

Your markdown code can be automatically hightlighted by prefixing code blocks with the language extension,
like we do with <code>```html</code>. The docs uses [code-prettify](https://github.com/google/code-prettify) underneath,
so check if your language is supported.


For instance you write:

```
```html
<ul>
  <li><button>Chrome</button></li>
  <li><button>Firefox</button></li>
  <li><button>Opera</button></li>
  <li><button>Safari</button></li>
  <li><button>Microsoft Edge</button></li>
</ul>
``````

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

## Inline demos

You can write an inline demo in your markdown by prepending
the code block with `<!-- demo -->`. Demos supports HTML, CSS and JavaScript (ES5, ES6 and JSX) all the way back to IE9!
Example:

```
```html
<!-- demo -->
<style>
  #press-button { padding: .3em; font-size: inherit; }
</style>
<button id="press-button">Press me</button>
<script>
  document.addEventListener('click', event => {
    if (event.target.nodeName === 'BUTTON')
      alert('You pressed me')
  })
</script>
``````

becomes:


```html
<!-- demo -->
<style>
  #press-button { padding: .3em; font-size: inherit; }
</style>
<button id="press-button">Press me</button>
<script>
  document.addEventListener('click', event => {
    if (event.target.nodeName === 'BUTTON')
      alert('You pressed me')
  })
</script>
```
