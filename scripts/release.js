const fs = require('fs');
const cpx = require('cpx');
const path = require('path');
const execa = require('execa');
const Listr = require('listr');
const chalk = require('chalk');
const semver = require('semver');
const inquirer = require('inquirer');

const pkg = require('../package.json');
const bowerPkg = require('../bower.json');

const joinRoot = path.join.bind(path, __dirname, '..');

const BUILD_DIR = joinRoot('build');

function checkBranch() {
  return execa.shell('git rev-parse --abbrev-ref HEAD').then((result) => {
    if (result.stdout !== 'master') {
      throw new Error(chalk.bold.red('Please run release script on master branch.'));
    }
  });
}

function compareWithDevelop() {
  return execa.shell('git rev-list --count master..develop').then((result) => {
    if (result.stdout !== '0') {
      throw new Error(chalk.bold.red('master branch is not up-to-date with develop branch'));
    }
  });
}

function checkWorkingTree() {
  return execa.shell('git status -s').then((result) => {
    if (result.stdout !== '') {
      throw new Error(chalk.bold.red('Please commit local changes before releasing.'));
    }
  });
}

function prompt() {
  const questions = [{
    type: 'list',
    name: 'version',
    message: 'Which type of release is this?',
    choices: ['patch', 'minor', 'major', 'beta'].map((type) => {
      const version = type === 'beta' ?
        semver.inc(pkg.version, 'prerelease', 'beta') :
        semver.inc(pkg.version, type);

      return {
        name: `${type} ${chalk.dim.magenta(version)}`,
        value: version,
      };
    }).concat([
      new inquirer.Separator(),
      {
        name: 'others',
        value: null,
      },
    ]),
  }, {
    type: 'input',
    name: 'version',
    message: `Please enter the version (current: ${pkg.version}):`,
    when: answers => !answers.version,
    validate(input) {
      if (!semver.valid(input)) {
        return 'Please enter a valid semver like `a.b.c`.';
      }

      if (!semver.gt(input, pkg.version)) {
        return `New version must be greater than ${pkg.version}.`;
      }

      return true;
    },
  }, {
    type: 'confirm',
    name: 'confirm',
    default: false,
    message: answers => `Releasing version:${answers.version} - are you sure?`,
  }];

  return inquirer.prompt(questions);
}

function runTask(options) {
  if (!options.confirm) {
    process.exit(0);
  }

  const tasks = new Listr([{
    title: 'Create bundle',
    task: () => execa.shell('npm run bundle', {
      env: {
        SCROLLBAR_VERSION: options.version,
      },
    }),
  }, {
    title: 'Compile TypeScript',
    task: async () => {
      await execa.shell('npm run compile');

      const entry = `${BUILD_DIR}/index.js`;
      const content = fs.readFileSync(entry, 'utf8');

      fs.writeFileSync(entry,
        content.replace('__SCROLLBAR_VERSION__', JSON.stringify(options.version)),
      );
    },
  }, {
    title: `Bump Bower version: ${pkg.version} -> ${options.version}`,
    task: () => {
      bowerPkg.version = options.version;

      fs.writeFileSync(joinRoot('bower.json'), JSON.stringify(bowerPkg, null, 2));
    },
  }, {
    title: 'Commit changes',
    task: async () => {
      await execa.shell('git add --all');
      await execa.shell(`git commit -m "[build] ${options.version}"`);
    }
  }, {
    title: `Bump NPM version: ${pkg.version} -> ${options.version}`,
    task: () => execa.shell(`npm version ${options.version}`),
  }, {
    title: 'Copy files to working directory',
    task: () => {
      cpx.copySync(joinRoot('dist/**'), `${BUILD_DIR}/dist`);
      cpx.copySync(joinRoot('package.json'), BUILD_DIR);
      cpx.copySync(joinRoot('README.md'), BUILD_DIR);
      cpx.copySync(joinRoot('CHANGELOG.md'), BUILD_DIR);
      cpx.copySync(joinRoot('LICENSE'), BUILD_DIR);
    },
  }, {
    title: `Publish ${options.version}`,
    task: () => {
      return semver.prerelease(options.version) ?
        execa.shell(`cd ${BUILD_DIR} && npm publish --tag beta`) :
        execa.shell(`cd ${BUILD_DIR} && npm publish`);
    },
  }, {
    title: 'Push to GitHub',
    task: async () => {
      await execa.shell('git push');
      await execa.shell('git push --tags');
    },
  }]);

  return tasks.run();
}

checkBranch()
  .then(checkWorkingTree)
  .then(compareWithDevelop)
  .then(prompt)
  .then(runTask)
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
