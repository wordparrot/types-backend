"use strict";
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
exports.FileUtility = void 0;
const fs_1 = require("fs");
const lodash_1 = require("lodash");
const util_1 = require("util");
const __1 = require("../..");
const readFilePromisified = (0, util_1.promisify)(fs_1.readFile);
const writeFilePromisified = (0, util_1.promisify)(fs_1.writeFile);
const deleteFilePromisified = (0, util_1.promisify)(fs_1.unlink);
const statPromisified = (0, util_1.promisify)(fs_1.stat);
const mkdirPromisified = (0, util_1.promisify)(fs_1.mkdir);
const rmdirPromisified = (0, util_1.promisify)(fs_1.rm);
class FileUtility {
    constructor(config) {
        this.tempFolder = process.env.WORDPARROT_TEMP_FILE_PATH || `${process.cwd()}/content/temp`;
        this.repositoriesFolder = process.env.WORDPARROT_REPOSITORIES_FILE_PATH ||
            `${process.cwd()}/content/repositories`;
        this.uniqId = config.uniqId;
        this.pipelineJobId = config.pipelineJobId;
        this.pipelineNodeId = config.pipelineNodeId;
        this.filename = config.filename;
        this.buffer = config.buffer;
        this.encoding = config.encoding || "utf8";
        this.extension = (0, __1.getExtension)(this.filename);
        this.mimeType = config.mimeType;
        this.repositoryId = config.repositoryId;
        this.repositoryFileId = config.repositoryFileId;
        this.parentRepositoryItem = config.parentRepositoryItem;
        this.predefinedPath = config.predefinedPath;
    }
    get jobPath() {
        return `${this.tempFolder}/${this.pipelineJobId}`;
    }
    get nodePath() {
        return `${this.jobPath}/${this.pipelineNodeId}`;
    }
    get filePath() {
        return `${this.nodePath}/${this.filename}`;
    }
    get repositoriesPath() {
        return `${this.repositoriesFolder}/${this.repositoryId}`;
    }
    get repositoriesFilePath() {
        if (!this.filename) {
            throw new Error("Cannot get repository file path: filename required.");
        }
        if (!this.repositoryId) {
            throw new Error("Cannot get repository file path: repository ID required.");
        }
        return `${this.repositoriesFolder}/${this.repositoryId}/${this.filename}`;
    }
    getMetadata() {
        var _a;
        if (!this.predefinedPath && !this.filePath) {
            throw new Error("File Utility getMetadata(): no path available for file source.");
        }
        return {
            uniqId: (_a = this.uniqId) !== null && _a !== void 0 ? _a : this.generateUniqueId(),
            filename: this.filename,
            path: this.predefinedPath || this.filePath,
            type: (0, __1.getExtension)(this.filename),
            mimeType: this.mimeType,
            encoding: this.encoding,
            pipelineJobId: this.pipelineJobId,
            pipelineNodeId: this.pipelineNodeId,
            repositoryId: this.repositoryId,
            repositoryFileId: this.repositoryFileId,
            parentRepositoryItem: this.parentRepositoryItem,
        };
    }
    generateUniqueId() {
        if (this.pipelineJobId && this.pipelineNodeId) {
            return `job_${this.pipelineJobId}_${this.pipelineNodeId}_${this.filename}`;
        }
        return `timestamp_${Date.now()}_${this.filename}`;
    }
    saveToTemp(encoding) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createNodeTempFolders();
            yield this.writeToTempFolder(encoding || this.encoding);
            return {
                uniqId: (_a = this.uniqId) !== null && _a !== void 0 ? _a : `${this.pipelineJobId}_${this.pipelineNodeId}_${this.filename}`,
                filename: this.filename,
                path: this.filePath,
                type: (0, __1.getExtension)(this.filename),
                mimeType: this.mimeType,
                encoding: encoding || this.encoding,
                pipelineJobId: this.pipelineJobId,
                pipelineNodeId: this.pipelineNodeId,
                repositoryId: this.repositoryId,
                repositoryFileId: this.repositoryFileId,
                parentRepositoryItem: this.parentRepositoryItem,
            };
        });
    }
    createNodeTempFolders() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield statPromisified(this.jobPath);
            }
            catch (e) {
                // This folder does not exist yet
                try {
                    yield mkdirPromisified(this.jobPath);
                }
                catch (e) {
                    console.log(e);
                    // This folder does not exist yet
                    throw new Error("cannot_make_temp_job_folder");
                }
            }
            try {
                yield statPromisified(this.nodePath);
            }
            catch (e) {
                // This folder does not exist yet
                try {
                    yield mkdirPromisified(this.nodePath);
                }
                catch (e) {
                    console.log(e);
                    // This folder does not exist yet
                    throw new Error("cannot_make_temp_node_folder");
                }
            }
        });
    }
    writeToTempFolder(encoding = "utf8") {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.buffer) {
                throw new Error("File Utility writeToTempFolder: no buffer found.");
            }
            return writeFilePromisified(this.filePath, this.buffer, encoding);
        });
    }
    createRepositoryFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield statPromisified(this.repositoriesPath);
            }
            catch (e) {
                // This folder does not exist yet
                try {
                    yield mkdirPromisified(this.repositoriesPath);
                }
                catch (e) {
                    console.log(e);
                    // This folder does not exist yet
                    throw new Error("cannot_make_repositories_folder");
                }
            }
        });
    }
    retrieveBufferFromTemp() {
        return __awaiter(this, void 0, void 0, function* () {
            this.buffer = yield readFilePromisified(this.filePath);
            return this.buffer;
        });
    }
    retrieveBufferFromRepository() {
        return __awaiter(this, void 0, void 0, function* () {
            this.buffer = yield readFilePromisified(this.repositoriesFilePath);
            return this.buffer;
        });
    }
    static getBuffer(fileMetadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const { path } = fileMetadata;
            return readFilePromisified(path);
        });
    }
    saveTempToRepositoryFolder(encoding = "utf8", buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.buffer) {
                    buffer = yield this.retrieveBufferFromTemp();
                }
            }
            catch (e) {
                return {
                    path: this.repositoriesFilePath,
                    filename: this.filename,
                    operation: "save",
                    success: false,
                };
            }
            try {
                if (!this.repositoriesPath) {
                    throw new Error("repositories_path_not_set");
                }
                try {
                    yield statPromisified(this.repositoriesFilePath);
                    // File by this name already exists, increment copy number
                    this.incrementCopyNumber();
                    yield writeFilePromisified(this.repositoriesFilePath, buffer, encoding);
                    return {
                        path: this.repositoriesFilePath,
                        filename: this.filename,
                        operation: "save",
                        success: true,
                    };
                }
                catch (e) {
                    // file does not exist
                    try {
                        yield writeFilePromisified(this.repositoriesFilePath, buffer, encoding);
                        return {
                            path: this.repositoriesFilePath,
                            filename: this.filename,
                            operation: "save",
                            success: true,
                        };
                    }
                    catch (e) {
                        console.log(e);
                        throw new Error("unable_to_save");
                    }
                }
            }
            catch (e) {
                return {
                    path: this.repositoriesFilePath,
                    filename: this.filename,
                    operation: "save",
                    error: e.message,
                    success: false,
                };
            }
        });
    }
    deleteFromRepositoryFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.repositoriesPath) {
                    throw new Error("repositories_path_not_set");
                }
                try {
                    yield deleteFilePromisified(this.repositoriesFilePath);
                }
                catch (e) {
                    throw new Error("unable_to_delete");
                }
                return {
                    path: this.repositoriesFilePath,
                    filename: this.filename,
                    operation: "delete",
                    success: true,
                };
            }
            catch (e) {
                return {
                    path: this.repositoriesFilePath,
                    filename: this.filename,
                    operation: "delete",
                    error: e.message,
                    success: false,
                };
            }
        });
    }
    removeNodeFolder() {
        return rmdirPromisified(this.nodePath, { recursive: true });
    }
    // Change filename.txt to filename(1).txt
    incrementCopyNumber() {
        let filenameBase = (0, __1.getFilenameBase)(this.filename);
        if (this.hasCopyNumber(filenameBase)) {
            const int = parseInt(filenameBase[filenameBase.length - 2]);
            filenameBase = (0, __1.replaceStringIndexAt)(filenameBase, filenameBase.length - 2, (int + 1).toString());
            this.filename = filenameBase + "." + (0, __1.getExtension)(this.filename);
        }
        else {
            this.filename =
                filenameBase +
                    `(${Math.floor(Date.now() / 1000)}).` +
                    (0, __1.getExtension)(this.filename);
        }
    }
    hasCopyNumber(str) {
        if (str.length <= 3) {
            return false;
        }
        if (str[str.length - 1] !== ")") {
            return false;
        }
        if (!(0, lodash_1.isInteger)(str[str.length - 2])) {
            return false;
        }
        if (str[str.length - 3] !== "(") {
            return false;
        }
        return true;
    }
}
exports.FileUtility = FileUtility;
