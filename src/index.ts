import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as toolCache from '@actions/tool-cache';

type Option<T> = T | undefined;

async function run(): Promise<void> {
  const version: Option<string> = core.getInput('version', {required: false});
  // Allow new or old syntax - some docs said 'workspace', others said 'workspace_id'
  const workspaceId: Option<string> = core.getInput('workspace', {required: false})
    ?? core.getInput('workspace_id', {required: false});

  const apiKey: Option<string> = process.env.MABL_API_KEY;

  const nodePath = await findNode();

  if (!nodePath) {
    return;
  }

  await installCli(nodePath, version);

  if (apiKey) {
    if (!(await authenticateWithApiKey(apiKey, nodePath))) {
      return;
    }
  }

  if (workspaceId) {
    if (!apiKey) {
      core.setFailed('Please specify api key as an environment variable');
      return;
    }
    await configureWorkspace(workspaceId, nodePath);
  }
}

async function installCli(nodePath: string, version?: string): Promise<void> {
  const installCommand = version
    ? `./bin/:npm install -g @mablhq/mabl-cli@${version}`
    : './bin/npm install -g @mablhq/mabl-cli';
  const options = {
    cwd: nodePath,
  };
  return exec.exec(installCommand, [], options);
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
  } catch (error) {
    core.setFailed(
      `Failed while trying to configure workspace with error ${error}`,
    );

    return false;
  }
  await exec.exec(`mabl config list`, [], options);

  return true;
}

async function findNode(): Promise<Option<string>> {
  const allNodeVersions = await toolCache.findAllVersions('node');
  if (!(allNodeVersions && allNodeVersions[0])) {
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
