import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as toolCache from '@actions/tool-cache';

async function run() {
  const version = core.getInput('version', {required: false});
  // const workspace = core.getInput('workspace', {required: false});
  const apiKey: string | undefined = process.env.MABL_API_KEY;

  if (!installCli(version)) {
    return;
  }

  if (!apiKey) {
    core.setFailed('Please specify api key as an environment variable');
    return;
  }
  authenticateWithApiKey(apiKey);
  // if (workspace) {
  // configureWorkspace(workspace);
  // }
}

function installCli(version: string): boolean {
  const allNodeVersions = toolCache.findAllVersions('node');
  if (!allNodeVersions) {
    core.setFailed(
      'No node version installed.  Please add a "actions/setup-node" step to your workflow or install a node version some other way.',
    );
    return false;
  }
  const nodeVersion = allNodeVersions[0];
  const nodePath = toolCache.find('node', allNodeVersions[0]);
  core.info(`Found node version ${nodeVersion}.  Installing mabl CLI`);

  const installCommand = version
    ? 'npm install @mablhq/mabl-cli'
    : `npm install @mablhq/mabl-cli@${version}`;

  //TODO:  Maybe listen for errors to fail the action if the install fails?
  exec.exec(installCommand, [], {cwd: nodePath});

  return false;
}

function configureWorkspace(workspace: string) {
  exec.exec(`mabl config set workspace ${workspace} && mabl config list`);
}

function authenticateWithApiKey(apiKey?: string) {
  const command: string = `mabl auth activate-key ${apiKey}`;
  exec.exec(command);
}

run();
