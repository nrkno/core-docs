# @nrk/core-docs

> `@nrk/core-docs` makes it easy to write documentation for your project in [markdown](https://github.com/markedjs/marked) and 
render it beautifully.

## Usage 

Read usage in the [docs](https://static.nrk.no/core-docs/latest/index.html). 
See other live examples at [`@nrkno/core-css`](https://static.nrk.no/core-css/latest/index.html), 
[`@nrkno/core-analytics`](https://static.nrk.no/core-analytics/latest/index.html) 
and [`@nrkno/core-icons`](https://static.nrk.no/core-icons/latest/index.html).

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
