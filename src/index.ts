import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function run() {
  const version = core.getInput('version', {required: false});
  // const workspace = core.getInput('workspace', {required: false});
  const apiKey: string | undefined = process.env.MABL_API_KEY;

  installCli(version);
  if (!apiKey) {
    core.setFailed('Please specify api key as an environment variable');
    return;
  }
  authenticateWithApiKey(apiKey);
  // if (workspace) {
  // configureWorkspace(workspace);
  // }
}

function installCli(version: string) {
  const installCommand = version
    ? 'npm install @mablhq/mabl-cli'
    : `npm install @mablhq/mabl-cli@${version}`;

  //TODO:  Maybe listen for errors to fail the action if the install fails?
  exec.exec(installCommand);
}

function configureWorkspace(workspace: string) {
  exec.exec(`mabl config set workspace ${workspace} && mabl config list`);
}

function authenticateWithApiKey(apiKey?: string) {
  const command: string = `mabl auth activate-key ${apiKey}`;
  exec.exec(command);
}

run();
