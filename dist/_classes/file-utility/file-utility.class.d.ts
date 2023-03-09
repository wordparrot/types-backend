/// <reference types="node" />
/// <reference types="node" />
import { WriteFileOptions } from "fs";
import { FileMetadata, FileMetadataContentFolder, FileUtilityConfig } from "wordparrot-types";
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
    header?: string;
    tagline?: string;
    imagesFolder: string;
    tempFolder: string;
    repositoriesFolder: string;
    constructor(config: FileUtilityConfig<WriteFileOptions>);
    get jobPath(): string;
    get nodePath(): string;
    get filePath(): string;
    get imagesPath(): string;
    get repositoriesPath(): string;
    get repositoriesFilePath(): string;
    getMetadata(): FileMetadata;
    private generateUniqueId;
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
