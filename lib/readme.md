# Core Docs

> `@nrk/core-docs` makes it easy to write documentation for your project in [markdown](https://github.com/markedjs/marked) and 
render it beautifully.

---

## Installation

Create an `index.html` file in your project with a `<title>`, `<ul>` and `<script>` tag like this:

```html
<title>Core Docs</title>
<ul>
  <li><a href="?readme.md">Core Docs</a></li>
  <li><a href="https://github.com/nrkno/core-docs"><img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/github.svg" width="15"> View on Github</a></li>
  <li><a href="https://github.com/nrkno/core-docs/releases"><img src="https://rawgit.com/nrkno/core-icons/master/lib/nrk-poll.svg" width="15"> View changelog</a></li>
</ul>
<script src="https://static.nrk.no/core-docs/latest/core-docs.js" charset="utf-8" defer></script>
```

Then change the title and menu heading to your desired name, add links to repo, changelog and other useful places for your project.
The script will parse the menu and render the `readme.md` linked to from there and render links to each subsection in the menu.

Use a question mark in the link when pointing to files (`?readme.md`) and use a hash symbol when pointing to file sections (`?readme.md#more`)

---

## Syntax highlighting

Your code can be automatically hightlighted by prefixing code blocks with the language extension,
like <code>```html</code>. It uses [code-prettify](https://github.com/google/code-prettify) underneath,
so check if your language is supported.


For instance:

```
```html
<input type="text" class="my-input" placeholder="Type &quot;C&quot;...">
<ul>
  <li><button>Chrome</button></li>
  <li><button>Firefox</button></li>
  <li><button>Opera</button></li>
  <li><button>Safari</button></li>
  <li><button>Microsoft Edge</button></li>
</ul>

``````

becomes:


```html
<input type="text" class="my-input" placeholder="Type &quot;C&quot;...">
<ul>
  <li><button>Chrome</button></li>
  <li><button>Firefox</button></li>
  <li><button>Opera</button></li>
  <li><button>Safari</button></li>
  <li><button>Microsoft Edge</button></li>
</ul>

```

---

## Inline demos


You can write an inline demo in your markdown, have it execute and be rendered by prefixing it with 
the `<!-- demo -->` above the markdown code block.


For instance this:

```html
<!--demo-->
<input type="text" class="my-input" placeholder="Type &quot;C&quot;...">
<ul>
  <li><button>Chrome</button></li>
  <li><button>Firefox</button></li>
  <li><button>Opera</button></li>
  <li><button>Safari</button></li>
  <li><button>Microsoft Edge</button></li>
</ul>
```

gets rendered as:


```html
    <!--demo-->
    <input type="text" class="my-input" placeholder="Type &quot;C&quot;...">
    <ul>
      <li><button>Chrome</button></li>
      <li><button>Firefox</button></li>
      <li><button>Opera</button></li>
      <li><button>Safari</button></li>
      <li><button>Microsoft Edge</button></li>
    </ul>
```


