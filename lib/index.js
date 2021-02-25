"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const toolCache = __importStar(require("@actions/tool-cache"));
function run() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const version = core.getInput('version', { required: false });
        // Allow new or old syntax - some docs said 'workspace', others said 'workspace_id'
        const workspaceId = (_b = (_a = core.getInput('workspace', { required: false })) !== null && _a !== void 0 ? _a : core.getInput('workspace_id', { required: false })) !== null && _b !== void 0 ? _b : core.getInput('workspace-id', { required: false }); // dash case is used by GitHub produced Actions
        const apiKey = process.env.MABL_API_KEY;
        const nodePath = yield findNode();
        if (!nodePath) {
            return;
        }
        yield installCli(nodePath, version);
        if (apiKey) {
            if (!(yield authenticateWithApiKey(apiKey, nodePath))) {
                return;
            }
        }
        if (workspaceId) {
            if (!apiKey) {
                core.setFailed('Please specify api key as an environment variable');
                return;
            }
            yield configureWorkspace(workspaceId, nodePath);
        }
    });
}
function installCli(nodePath, version) {
    return __awaiter(this, void 0, void 0, function* () {
        const installCommand = version
            ? `./bin/npm install -g @mablhq/mabl-cli@${version}`
            : './bin/npm install -g @mablhq/mabl-cli';
        const options = {
            cwd: nodePath,
        };
        return exec.exec(installCommand, [], options);
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
        catch (error) {
            core.setFailed(`Failed while trying to configure workspace with error ${error}`);
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
