"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const toolCache = __importStar(require("@actions/tool-cache"));
const REQUIRED_NODEJS_MAJOR_VERSION = 18;
async function run() {
    const version = core.getInput('version', { required: false });
    // Allow new or old syntax - some docs said 'workspace', others said 'workspace_id'
    const workspaceId = core.getInput('workspace', { required: false }) ??
        core.getInput('workspace_id', { required: false }) ??
        core.getInput('workspace-id', { required: false }); // dash case is used by GitHub produced Actions
    const apiKey = process.env.MABL_API_KEY;
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
async function installCli(nodePath, version) {
    const binPrefix = process.platform === 'win32' ? '' : 'bin/';
    // --unsafe is required if the installation process needs to build keytar using node-gyp.
    // There may be no pre-built binaries for keytar on the host OS. Currently this is the case only
    // for linux.
    const unsafeFlag = process.platform === 'linux' ? ' --unsafe' : '';
    const installCommand = `./${binPrefix}npm install -g @mablhq/mabl-cli${version ? '@' + version : ''}${unsafeFlag}`;
    const options = {
        cwd: nodePath,
    };
    return exec.exec(installCommand, [], options);
}
async function configureWorkspace(workspace, nodePath) {
    const options = {
        cwd: nodePath,
    };
    try {
        await exec.exec(`mabl config set workspace ${workspace}`, [], options);
    }
    catch (error) {
        core.setFailed(`Failed while trying to configure workspace with error ${error}`);
        return false;
    }
    await exec.exec(`mabl config list`, [], options);
    return true;
}
async function findNode() {
    const allNodeVersions = await toolCache.findAllVersions('node');
    const nodeTargetVersion = allNodeVersions
        .filter((version) => version.startsWith(`${REQUIRED_NODEJS_MAJOR_VERSION}.`))?.[0];
    // If Node is installed, but the required version isn't, mark as a failure
    if (allNodeVersions && allNodeVersions.length > 0 && !nodeTargetVersion) {
        core.warning(`Could not find required Node.js version ${REQUIRED_NODEJS_MAJOR_VERSION}.x installed. This install will fallback to an unsupported version which may not function correctly.`);
    }
    const nodeVersion = nodeTargetVersion ?? allNodeVersions[0];
    if (!(allNodeVersions && nodeVersion)) {
        core.setFailed('No Node.js version installed.  Please add a "actions/setup-node" step to your workflow or install a Node.js version some other way.');
        return;
    }
    core.info(`Found node version ${nodeVersion}.  Installing mabl CLI`);
    return toolCache.find('node', nodeVersion);
}
async function authenticateWithApiKey(apiKey, nodePath) {
    const options = {
        cwd: nodePath,
    };
    const command = `mabl auth activate-key ${apiKey}`;
    try {
        await exec.exec(command, [], options);
    }
    catch (err) {
        core.setFailed(`Failed while trying to activate API key with error ${err}`);
        return false;
    }
    await exec.exec('mabl auth info', [], options);
    return true;
}
run();
