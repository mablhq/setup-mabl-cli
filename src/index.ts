import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as toolCache from '@actions/tool-cache';

async function run() {
  const version = core.getInput('version', {required: false});
  const workspace = core.getInput('workspace', {required: false});
  const apiKey: string | undefined = process.env.MABL_API_KEY;

  const nodePath = findNode();

  if (!nodePath) {
    return;
  }

  await installCli(version, nodePath);

  if (!apiKey) {
    core.setFailed('Please specify api key as an environment variable');
    return;
  }

  authenticateWithApiKey(apiKey, nodePath);

  if (workspace) {
    configureWorkspace(workspace);
  }
}

async function installCli(version: string, nodePath: string) {
  const installCommand = version
    ? `./bin/:npm install -g @mablhq/mabl-cli@${version}`
    : './bin/npm install -g @mablhq/mabl-cli';
  const options = {
    cwd: nodePath,
  };
  await exec.exec(installCommand, [], options);
}

function configureWorkspace(workspace: string) {
  exec.exec(`mabl config set workspace ${workspace} && mabl config list`);
}

function findNode() {
  const allNodeVersions = toolCache.findAllVersions('node');
  if (!allNodeVersions) {
    core.setFailed(
      'No node version installed.  Please add a "actions/setup-node" step to your workflow or install a node version some other way.',
    );
    return;
  }
  const nodeVersion = allNodeVersions[0];
  core.info(`Found node version ${nodeVersion}.  Installing mabl CLI`);

  return toolCache.find('node', nodeVersion);
}

async function authenticateWithApiKey(apiKey: string, nodePath: string) {
  const options = {
    cwd: nodePath,
  };

  const command: string = `mabl auth activate-key ${apiKey}`;
  await exec.exec(command, [], options);
}

run();
