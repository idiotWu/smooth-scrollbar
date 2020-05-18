#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"

# Pull requests and commits to other branches shouldn't try to deploy, just build to verify
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Skipping deploy; just doing a build."
    exit 0
fi

# Save some useful information
REPO=`git config remote.origin.url`
COMMIT_AUTHOR_NAME=`git show -s --format='%an'`
COMMIT_AUTHOR_EMAIL=`git show -s --format='%ae'`
SSH_REPO=${REPO/\/\/github.com/\/\/$GITHUB_TOKEN@github.com}
SHA=`git rev-parse --verify HEAD`

# Clone the existing gh-pages for this repo into out/
# Create a new empty branch if gh-pages doesn't exist yet (should only happen on first deply)
git clone $REPO out
cd out

echo "Checking out ${TARGET_BRANCH} branch"
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH

# Clean out existing contents
echo "Removing old contents"
cd ..
rm -rf ./out/**/* || exit 0

# Compiling
npm run ghpages

# Copy files
echo "Copying new contents"
cp -v ./__demo__/index.html ./out
cp -vr ./__demo__/images ./out
cp -vr ./.tmp/* ./out
cd ./out

# Now let's go have some fun with the cloned repo
git config user.name "$COMMIT_AUTHOR_NAME"
git config user.email "$COMMIT_AUTHOR_EMAIL"

# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git add --all
git commit -m "Deploy to GitHub Pages: ${SHA}"

# Now we can push.
git push --force $SSH_REPO $TARGET_BRANCH
