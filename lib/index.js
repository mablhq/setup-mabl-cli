"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const toolCache = __importStar(require("@actions/tool-cache"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const version = core.getInput('version', { required: false });
        const workspace = core.getInput('workspace', { required: false });
        const apiKey = process.env.MABL_API_KEY;
        const nodePath = yield findNode();
        if (!nodePath) {
            return;
        }
        yield installCli(version, nodePath);
        if (!apiKey) {
            core.setFailed('Please specify api key as an environment variable');
            return;
        }
        if (!(yield authenticateWithApiKey(apiKey, nodePath))) {
            return;
        }
        if (workspace) {
            yield configureWorkspace(workspace, nodePath);
        }
    });
}
function installCli(version, nodePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const installCommand = version
            ? `./bin/:npm install -g @mablhq/mabl-cli@${version}`
            : './bin/npm install -g @mablhq/mabl-cli';
        const options = {
            cwd: nodePath,
        };
        yield exec.exec(installCommand, [], options);
    });
}
function configureWorkspace(workspace, nodePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            cwd: nodePath,
        };
        try {
            yield exec.exec(`mabl config set workspace ${workspace}`, [], options);
        }
        catch (err) {
            core.setFailed(`Failed while trying to configure workspace with error ${err}`);
            return false;
        }
        yield exec.exec(`mabl config list`, [], options);
        return true;
    });
}
function findNode() {
    return __awaiter(this, void 0, void 0, function* () {
        const allNodeVersions = yield toolCache.findAllVersions('node');
        if (!(allNodeVersions && allNodeVersions[0])) {
            core.setFailed('No node version installed.  Please add a "actions/setup-node" step to your workflow or install a node version some other way.');
            return;
        }
        const nodeVersion = allNodeVersions[0];
        core.info(`Found node version ${nodeVersion}.  Installing mabl CLI`);
        return toolCache.find('node', nodeVersion);
    });
}
function authenticateWithApiKey(apiKey, nodePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            cwd: nodePath,
        };
        const command = `mabl auth activate-key ${apiKey}`;
        try {
            yield exec.exec(command, [], options);
        }
        catch (err) {
            core.setFailed(`Failed while trying to activate API key with error ${err}`);
            return false;
        }
        yield exec.exec('mabl auth info', [], options);
        return true;
    });
}
run();
