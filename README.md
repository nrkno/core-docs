# core-docs

Core documentation system


# Usage

Create a new file called `index.html` and put this into it:

```html
<title>My documentation</title>
<ul>
  <li><a href="?docs.md">My documentation</a></li>
  <li><a href="..."><img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/github.svg"> View on Github</a></li>
  <li><a href="..."><img src="https://rawgit.com/nrkno/core-icons/master/lib/nrk-poll.svg"> View changelog</a></li>
</ul>
<script src="https://static.nrk.no/core-docs/latest/core-docs.js"></script>
```

## Local development
First clone `@nrk/core-docs` and install dependencies:

```bash
git clone git@github.com:nrkno/core-docs.git
cd core-docs
npm install
npm start # Your browser will open documentation with hot reloading
```

### Building and committing
After having applied changes, remember to build the project before pushing the changes upstream.

```bash
git checkout -b feature/my-changes
# update the source code
npm run build
git commit -am "Add my changes"
git push origin feature/my-changes
# then make PR to the master branch,
# and assign a developer to review your code
```

> NOTE! Please also make sure to keep commits small, clean and that the commit message actually refers to the updated files. Formally, make sure the message is **Capitalized** and **starts with a verb**.
