# @nrk/core-docs

> `@nrk/core-docs` makes it easy to write documentation for your project in [markdown](https://github.com/markedjs/marked) and 
render it beautifully.

## Documentation

https://static.nrk.no/core-docs/latest/

## Getting started

core-docs can parse and render all markdown files you put in your repository. The only requirement is an `index.html` file which declares the menu as a `<ul>` and loads the core-docs script. Link to your markdown files using their relative path, prepended with `?`. Example:

```html
<!doctype html>
<head>
  <meta charset="utf-8">
</head>
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
## Local development
First clone `@nrk/core-docs` and install its dependencies:

```bash
git clone git@github.com:nrkno/core-docs.git
cd core-docs
npm install
npm start # Your browser will open documentation with hot reloading
```

## Building and committing
After having applied changes, remember to build before pushing the changes upstream.

```bash
git checkout -b feature/my-changes
# update the source code
npm run build
git commit -am "Add my changes"
git push origin feature/my-changes
# then make a PR to the master branch,
# and assign another developer to review your code
```

> NOTE! Please also make sure to keep commits small and clean (that the commit message actually refers to the updated files).  
> Stylistically, make sure the commit message is **Capitalized** and **starts with a verb in the present tense** (for example `Add minification support`).
