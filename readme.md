# @nrk/core-docs

> `@nrk/core-docs` makes it easy to write documentation for your project in [markdown](https://github.com/markedjs/marked) and 
render it beautifully.

## Examples

TODO add example here

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
