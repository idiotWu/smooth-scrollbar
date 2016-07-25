/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

module.exports = function writeFile(writeTo, content) {
  const re = new RegExp(path.dirname(writeTo), 'g');
  const transformed = content.replace(re, '.');

  fs.writeFileSync(writeTo, `${transformed}\n`, 'utf-8');
  console.log(`wrote file ${writeTo}`);
};
