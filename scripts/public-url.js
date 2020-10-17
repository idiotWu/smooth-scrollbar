const ip = require('ip');
const child_process = require('child_process');

function publicUrl(port) {
  return process.env.GITPOD_WORKSPACE_ID ?
              child_process.execSync(`gp url ${port}`).toString()
            : `http://${ip.address()}:${port}`;
}

module.exports = publicUrl;
