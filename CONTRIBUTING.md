# Contributing to Smooth Scrollbar

Thanks for contributing to Smooth Scrollbar!

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Submitting an issue

### 1. Search for Duplicates

Before you submit an issue, please search the issue tracker as it may already exist or even have been fixed.

### 2. Use a clear and descriptive title

A good title may catch our attention and therefore, your issue may be resolved quickly.

### 3. Include as much information as possible

If you are logging a bug, make sure to include the following:

- The version of Smooth Scrollbar
- The browser you are running on
- Steps to reproduce the behavior

### 4. Provide an online demo if possible

An online demo is a lifesaver! You can create an online demo on [codepan](codepan.net) with the following steps:

1. Open https://codepan.net/gist/4653b46f9e2d4c2f3585cebc1828859d
2. Modify the code as you want
3. Click **"..."** on the top right
4. Click **"Save Anonymous Gist"** (or "Save New Gist" if you've logged in)
5. Copy and paste the **URL** into issue body

### 5. Be patient

We want to fix all the issues as soon as possible, but we can't make guarantees about how fast your issue can be resolved. Your understanding and patience is greatly appreciated.

## Submitting a pull request

### 1. Make your changes in a new git branch

```
$ git checkout -b my-fix-branch develop
```

### 2. Follow the code style

Run `npm run lint` before committing.

### 3. Test your code

Make sure `npm test` passes.

### 4. Don't include unrelated changes

DO NOT include `dist/*` in your commit. Bundle files will be updated when publishing new version.

### 5. Don't submit PRs against the `master` branch

The `master` branch is considered as a snapshot of the latest release. All development should be done in the `develop` branch.

### 6. Use a clear and descriptive title for your PR

### 7. Write a convincing description

- If you are fixing a bug:

    - Provide detailed description of the bug, or links to the related issues.

- If you are adding new features:

    - Provide convincing reason to add this reason.


## Development setup

Before starting, make sure you are using [Node.js](http://nodejs.org/) 6+.

After cloning the repo, run:

```bash
$ npm install
```

Then run:

```bash
$ npm start
```

to start a dev server at `http://localhost:3000`.

Alternatively you can use Gitpod(an Online IDE which is free for Open Source) for contributing. With a single click it will launch a workspace and automatically clone the `smooth-scrollbar` repo, install the dependencies and run `npm start`.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/from-referrer/)
