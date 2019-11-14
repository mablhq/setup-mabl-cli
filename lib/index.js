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
        // const workspace = core.getInput('workspace', {required: false});
        const apiKey = process.env.MABL_API_KEY;
        const nodePath = findNode();
        if (!nodePath) {
            return;
        }
        yield installCli(version, nodePath);
        if (!apiKey) {
            core.setFailed('Please specify api key as an environment variable');
            return;
        }
        authenticateWithApiKey(apiKey, nodePath);
        // if (workspace) {
        // configureWorkspace(workspace);
        // }
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
function configureWorkspace(workspace) {
    exec.exec(`mabl config set workspace ${workspace} && mabl config list`);
}
function findNode() {
    const allNodeVersions = toolCache.findAllVersions('node');
    if (!allNodeVersions) {
        core.setFailed('No node version installed.  Please add a "actions/setup-node" step to your workflow or install a node version some other way.');
        return;
    }
    const nodeVersion = allNodeVersions[0];
    core.info(`Found node version ${nodeVersion}.  Installing mabl CLI`);
    return toolCache.find('node', nodeVersion);
}
function authenticateWithApiKey(apiKey, nodePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            cwd: nodePath,
        };
        const command = `mabl auth activate-key ${apiKey}`;
        yield exec.exec(command, [], options);
    });
}
run();
