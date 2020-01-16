import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as toolCache from '@actions/tool-cache';

async function run() {
  const version = core.getInput('version', {required: false});
  const workspace = core.getInput('workspace', {required: false});
  const apiKey: string | undefined = process.env.MABL_API_KEY;

  const nodePath = await findNode();

  if (!nodePath) {
    return;
  }

  await installCli(version, nodePath);

  if (!apiKey) {
    core.setFailed('Please specify api key as an environment variable');
    return;
  }

  if (!(await authenticateWithApiKey(apiKey, nodePath))) {
    return;
  }

  if (workspace) {
    await configureWorkspace(workspace, nodePath);
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

async function configureWorkspace(
  workspace: string,
  nodePath: string,
): Promise<boolean> {
  const options = {
    cwd: nodePath,
  };

  try {
    await exec.exec(`mabl config set workspace ${workspace}`, [], options);
  } catch (err) {
    core.setFailed(
      `Failed while trying to configure workspace with error ${err}`,
    );

    return false;
  }
  await exec.exec(`mabl config list`, [], options);

  return true;
}

async function findNode() {
  const allNodeVersions = await toolCache.findAllVersions('node');
  if (!allNodeVersions || !allNodeVersions[0]) {
    core.setFailed(
      'No node version installed.  Please add a "actions/setup-node" step to your workflow or install a node version some other way.',
    );
    return;
  }
  const nodeVersion = allNodeVersions[0];
  core.info(`Found node version ${nodeVersion}.  Installing mabl CLI`);

  return toolCache.find('node', nodeVersion);
}

async function authenticateWithApiKey(
  apiKey: string,
  nodePath: string,
): Promise<boolean> {
  const options = {
    cwd: nodePath,
  };

  const command: string = `mabl auth activate-key ${apiKey}`;
  try {
    await exec.exec(command, [], options);
  } catch (err) {
    core.setFailed(`Failed while trying to activate API key with error ${err}`);

    return false;
  }

  await exec.exec('mabl auth info', [], options);

  return true;
}

run();
