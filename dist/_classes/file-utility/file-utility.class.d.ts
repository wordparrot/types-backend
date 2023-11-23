/// <reference types="node" />
/// <reference types="node" />
import { WriteFileOptions } from "fs";
import { FileMetadata, FileMetadataContentFolder } from "wordparrot-types";
import { FileOperation } from "../..";
export declare class FileUtility {
    pipelineJobId: string;
    pipelineNodeId: string;
    filename: string;
    buffer?: Buffer;
    mimeType?: string;
    encoding?: WriteFileOptions;
    extension: string;
    repositoryId: string;
    repositoryFileId: string;
    uniqId: string;
    predefinedPath: string;
    imageId?: string;
    contentFolder?: FileMetadataContentFolder;
    parentRepositoryItem?: {
        nodeUniqId: string;
        uniqId: string;
    };
    header: string;
    caption: string;
    imagesFolder: string;
    tempFolder: string;
    repositoriesFolder: string;
    constructor(config: FileMetadata);
    get jobPath(): string;
    get nodePath(): string;
    get filePath(): string;
    get imagesPath(): string;
    get repositoriesPath(): string;
    get repositoriesFilePath(): string;
    getMetadata(): FileMetadata;
    private generateUniqueId;
    private getPublicURL;
    saveToTemp(encoding?: WriteFileOptions): Promise<FileMetadata>;
    private createNodeTempFolders;
    private writeToTempFolder;
    createRepositoryFolder(): Promise<void>;
    retrieveBufferFromTemp(): Promise<Buffer>;
    retrieveBufferFromRepository(): Promise<Buffer>;
    static getBuffer(fileMetadata: FileMetadata): Promise<Buffer>;
    saveTempToRepositoryFolder(encoding?: WriteFileOptions, buffer?: Buffer): Promise<FileOperation>;
    deleteFromRepositoryFolder(): Promise<FileOperation>;
    removeNodeFolder(): Promise<void>;
    incrementCopyNumber(): void;
    hasCopyNumber(str: string): boolean;
}
