# Core Docs

> `@nrk/core-docs` makes it easy to write documentation for your project in [markdown](https://github.com/markedjs/marked) and 
render it beautifully.

---

## Installation

To get started, create an `index.html` file in your project with a `<ul>` and `<script>` tag:

```html
<ul>
  <li><a href="?readme.md"></a></li>
  <li><a href="https://github.com/nrkno/core-docs"><img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/github.svg" width="15"> View on Github</a></li>
  <li><a href="https://github.com/nrkno/core-docs/releases"><img src="https://rawgit.com/nrkno/core-icons/master/lib/nrk-poll.svg" width="15"> View changelog</a></li>
</ul>
<script src="https://static.nrk.no/core-docs/latest/core-docs.js" charset="utf-8" defer></script>
```

Feel free to add links to code repo, changelog and other useful places for your project. 
Use a question mark in the link when pointing to files (`?readme.md`) and use a hash symbol when pointing to file sections (`?readme.md#more`).

Now create a simple `readme.md` in the same directory and open the `index.html` file. 
The script will parse the menu and fetch the first `readme.md` linked to from there and render menu links to each subsection in the markdown.
Use level 1 and level 2 headings in your markdown to control this sectioning.


---

## Syntax highlighting

Your code can be automatically hightlighted by prefixing code blocks with the language extension,
like we do with <code>```html</code>. The docs uses [code-prettify](https://github.com/google/code-prettify) underneath,
so check if your language is supported.


For instance you write:

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

---

## Inline demos


You can write an inline demo in your markdown, have it be rendered with
its raw code under it. Prepend code blocks with `<!-- demo -->` to activate
this for a code block.


For instance this markdown:

```
```html
<!-- demo -->
<ul>
  <li><button>Chrome</button></li>
  <li><button>Firefox</button></li>
  <li><button>Opera</button></li>
  <li><button>Safari</button></li>
  <li><button>Microsoft Edge</button></li>
</ul>
``````

 is rendered as follows:


```html
<!-- demo -->
<ul>
  <li><button>Chrome</button></li>
  <li><button>Firefox</button></li>
  <li><button>Opera</button></li>
  <li><button>Safari</button></li>
  <li><button>Microsoft Edge</button></li>
</ul>
```

This is very useful for creating code examples and at the same
time look at how the example is actually rendered.
