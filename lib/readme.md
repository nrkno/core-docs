# Core Docs

> `@nrk/core-docs` makes it easy to write documentation for your project in [markdown](https://github.com/markedjs/marked) and
render it beautifully.

## Getting started

Core Docs can parse and render all [markdown](https://github.com/markedjs/marked) files you put in your directory. The only requirement, is a `index.html` which declares the menu as a `<ul>` and loads `@nrk/core-docs`. Link to your markdown files using their relative path, prepended with `?`. Example:

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
```

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


## Tabs

To render all `<h4>` headings as tabs, set the `tabs` option to `true` in the `index.html` containing the menu:

```html
<ul>
...
</ul>
<script>
  window.coreDocs = {
    tabs: true   // Enable automatic tabs
  }
</script>
<script src="https://static.nrk.no/core-docs/major/1/core-docs.min.js" charset="utf-8"></script>
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


## React

You can also use React to render demos out of the box.

<script src="https://static.nrk.no/core-components/latest/core-toggle/core-toggle.jsx.js"></script>
```html
<!--demo-->
<div id="jsx-toggle-default"></div>
<script type="text/jsx">
  ReactDOM.render(<>
    <button>Toggle JSX</button>
    <CoreToggle hidden onToggle={console.log}>Content</CoreToggle>
  </>, document.getElementById('jsx-toggle-default'))
</script>
```
