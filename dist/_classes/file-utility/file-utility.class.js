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
const lodash_1 = require("lodash");
const promises_1 = require("node:fs/promises");
const __1 = require("../..");
class FileUtility {
    constructor(config) {
        this.imagesFolder = `${process.cwd()}/content/images`;
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
        this.imageId = config.imageId;
        this.contentFolder = config.contentFolder;
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
    get imagesPath() {
        return `${this.imagesFolder}/${this.filename}`;
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
        if (!this.predefinedPath && !this.nodePath && !this.contentFolder) {
            throw new Error("File Utility getMetadata(): no path available for file source.");
        }
        let path;
        if (this.predefinedPath) {
            path = this.predefinedPath;
        }
        else {
            switch (this.contentFolder) {
                case "images":
                    path = this.imagesPath;
                    break;
                case "temp":
                    path = this.jobPath;
                    break;
                case "repositories":
                    path = this.repositoriesFilePath;
                    break;
                default:
                    path = this.filePath;
            }
        }
        const baseMetadata = {
            uniqId: (_a = this.uniqId) !== null && _a !== void 0 ? _a : this.generateUniqueId(),
            filename: this.filename,
            path,
            type: (0, __1.getExtension)(this.filename),
            mimeType: this.mimeType,
            encoding: this.encoding,
        };
        if (this.imageId) {
            baseMetadata.imageId = this.imageId;
        }
        if (this.pipelineJobId) {
            baseMetadata.pipelineJobId = this.pipelineJobId;
        }
        if (this.pipelineJobId) {
            baseMetadata.pipelineNodeId = this.pipelineNodeId;
        }
        if (this.repositoryId) {
            baseMetadata.repositoryId = this.repositoryId;
        }
        if (this.repositoryFileId) {
            baseMetadata.repositoryFileId = this.repositoryFileId;
        }
        if (this.parentRepositoryItem) {
            baseMetadata.parentRepositoryItem = this.parentRepositoryItem;
        }
        return baseMetadata;
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
                yield (0, promises_1.stat)(this.jobPath);
            }
            catch (e) {
                // This folder does not exist yet
                try {
                    yield (0, promises_1.mkdir)(this.jobPath);
                }
                catch (e) {
                    console.log(e);
                    // This folder does not exist yet
                    throw new Error("cannot_make_temp_job_folder");
                }
            }
            try {
                yield (0, promises_1.stat)(this.nodePath);
            }
            catch (e) {
                // This folder does not exist yet
                try {
                    yield (0, promises_1.mkdir)(this.nodePath);
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
            return (0, promises_1.writeFile)(this.filePath, this.buffer, encoding);
        });
    }
    createRepositoryFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.stat)(this.repositoriesPath);
            }
            catch (e) {
                // This folder does not exist yet
                try {
                    yield (0, promises_1.mkdir)(this.repositoriesPath);
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
            this.buffer = yield (0, promises_1.readFile)(this.filePath);
            return this.buffer;
        });
    }
    retrieveBufferFromRepository() {
        return __awaiter(this, void 0, void 0, function* () {
            this.buffer = yield (0, promises_1.readFile)(this.repositoriesFilePath);
            return this.buffer;
        });
    }
    static getBuffer(fileMetadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const { path } = fileMetadata;
            return (0, promises_1.readFile)(path);
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
                    yield (0, promises_1.stat)(this.repositoriesFilePath);
                    // File by this name already exists, increment copy number
                    this.incrementCopyNumber();
                    yield (0, promises_1.writeFile)(this.repositoriesFilePath, buffer, encoding);
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
                        yield (0, promises_1.writeFile)(this.repositoriesFilePath, buffer, encoding);
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
                    yield (0, promises_1.unlink)(this.repositoriesFilePath);
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
        return (0, promises_1.rmdir)(this.nodePath, { recursive: true });
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
