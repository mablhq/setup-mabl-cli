import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function run() {
  const version = core.getInput('version', {required: false});
  const workspace = core.getInput('workspace', {required: false});

  installCli(version);
  if (workspace) {
    configureWorkspace(workspace);
  }
}

function installCli(version: string) {
  const installCommand = version
    ? 'npm install -g @mablhq/mabl-cli'
    : `npm install -g @mablhq/mabl-cli@${version}`;

  //TODO:  Maybe listen for errors to fail the action if the install fails?
  exec.exec(installCommand);
}

function configureWorkspace(workspace: string) {
  exec.exec(`mabl config set workspace ${workspace} && mabl config list`);
}

run();
