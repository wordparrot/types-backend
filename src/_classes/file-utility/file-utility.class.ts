import { BufferEncodingOption, WriteFileOptions, rm } from "fs";
import {
  FileMetadata,
  FileMetadataContentFolder,
  FileUtilityConfig,
} from "wordparrot-types";
import { isInteger, throttle } from "lodash";
import { promisify } from "util";
import {
  readFile,
  writeFile,
  unlink,
  stat,
  mkdir,
  rmdir,
} from "node:fs/promises";

import { FileOperation } from "../..";
import { getExtension, getFilenameBase, replaceStringIndexAt } from "../..";

export class FileUtility {
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

  public imagesFolder = `${process.cwd()}/content/images`;
  public tempFolder =
    process.env.WORDPARROT_TEMP_FILE_PATH || `${process.cwd()}/content/temp`;
  public repositoriesFolder =
    process.env.WORDPARROT_REPOSITORIES_FILE_PATH ||
    `${process.cwd()}/content/repositories`;

  constructor(config: FileUtilityConfig<WriteFileOptions>) {
    this.uniqId = config.uniqId;
    this.pipelineJobId = config.pipelineJobId;
    this.pipelineNodeId = config.pipelineNodeId;
    this.filename = config.filename;
    this.buffer = config.buffer;
    this.encoding = config.encoding || "utf8";
    this.extension = getExtension(this.filename);
    this.mimeType = config.mimeType;
    this.repositoryId = config.repositoryId;
    this.repositoryFileId = config.repositoryFileId;
    this.parentRepositoryItem = config.parentRepositoryItem;
    this.predefinedPath = config.predefinedPath;
    this.imageId = config.imageId;
    this.contentFolder = config.contentFolder;
  }

  get jobPath(): string {
    return `${this.tempFolder}/${this.pipelineJobId}`;
  }

  get nodePath(): string {
    return `${this.jobPath}/${this.pipelineNodeId}`;
  }

  get filePath(): string {
    return `${this.nodePath}/${this.filename}`;
  }

  get imagesPath(): string {
    return `${this.imagesFolder}/${this.filename}`;
  }

  get repositoriesPath(): string {
    return `${this.repositoriesFolder}/${this.repositoryId}`;
  }

  get repositoriesFilePath(): string {
    if (!this.filename) {
      throw new Error("Cannot get repository file path: filename required.");
    }

    if (!this.repositoryId) {
      throw new Error(
        "Cannot get repository file path: repository ID required."
      );
    }

    return `${this.repositoriesFolder}/${this.repositoryId}/${this.filename}`;
  }

  getMetadata(): FileMetadata {
    if (!this.predefinedPath && !this.nodePath && !this.contentFolder) {
      throw new Error(
        "File Utility getMetadata(): no path available for file source."
      );
    }

    let path: string;

    if (this.predefinedPath) {
      path = this.predefinedPath;
    } else {
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

    const baseMetadata: FileMetadata = {
      uniqId: this.uniqId ?? this.generateUniqueId(),
      filename: this.filename,
      path,
      type: getExtension(this.filename),
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

  private generateUniqueId(): string {
    if (this.pipelineJobId && this.pipelineNodeId) {
      return `job_${this.pipelineJobId}_${this.pipelineNodeId}_${this.filename}`;
    }
    return `timestamp_${Date.now()}_${this.filename}`;
  }

  async saveToTemp(encoding?: WriteFileOptions): Promise<FileMetadata> {
    await this.createNodeTempFolders();
    await this.writeToTempFolder(encoding || this.encoding);
    return {
      uniqId:
        this.uniqId ??
        `${this.pipelineJobId}_${this.pipelineNodeId}_${this.filename}`,
      filename: this.filename,
      path: this.filePath,
      type: getExtension(this.filename),
      mimeType: this.mimeType,
      encoding: encoding || this.encoding,
      pipelineJobId: this.pipelineJobId,
      pipelineNodeId: this.pipelineNodeId,
      repositoryId: this.repositoryId,
      repositoryFileId: this.repositoryFileId,
      parentRepositoryItem: this.parentRepositoryItem,
    };
  }

  private async createNodeTempFolders() {
    try {
      await stat(this.jobPath);
    } catch (e) {
      // This folder does not exist yet
      try {
        await mkdir(this.jobPath);
      } catch (e) {
        console.log(e);
        // This folder does not exist yet
        throw new Error("cannot_make_temp_job_folder");
      }
    }

    try {
      await stat(this.nodePath);
    } catch (e) {
      // This folder does not exist yet
      try {
        await mkdir(this.nodePath);
      } catch (e) {
        console.log(e);
        // This folder does not exist yet
        throw new Error("cannot_make_temp_node_folder");
      }
    }
  }

  private async writeToTempFolder(encoding: WriteFileOptions = "utf8") {
    if (!this.buffer) {
      throw new Error("File Utility writeToTempFolder: no buffer found.");
    }
    return writeFile(this.filePath, this.buffer, encoding);
  }

  async createRepositoryFolder() {
    try {
      await stat(this.repositoriesPath);
    } catch (e) {
      // This folder does not exist yet
      try {
        await mkdir(this.repositoriesPath);
      } catch (e) {
        console.log(e);
        // This folder does not exist yet
        throw new Error("cannot_make_repositories_folder");
      }
    }
  }

  async retrieveBufferFromTemp(): Promise<Buffer> {
    this.buffer = await readFile(this.filePath);
    return this.buffer;
  }

  async retrieveBufferFromRepository(): Promise<Buffer> {
    this.buffer = await readFile(this.repositoriesFilePath);
    return this.buffer;
  }

  static async getBuffer(fileMetadata: FileMetadata) {
    const { path } = fileMetadata;
    return readFile(path);
  }

  async saveTempToRepositoryFolder(
    encoding: WriteFileOptions = "utf8",
    buffer?: Buffer
  ): Promise<FileOperation> {
    try {
      if (!this.buffer) {
        buffer = await this.retrieveBufferFromTemp();
      }
    } catch (e) {
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
        await stat(this.repositoriesFilePath);
        // File by this name already exists, increment copy number
        this.incrementCopyNumber();

        await writeFile(this.repositoriesFilePath, buffer, encoding);

        return {
          path: this.repositoriesFilePath,
          filename: this.filename,
          operation: "save",
          success: true,
        };
      } catch (e) {
        // file does not exist
        try {
          await writeFile(this.repositoriesFilePath, buffer, encoding);
          return {
            path: this.repositoriesFilePath,
            filename: this.filename,
            operation: "save",
            success: true,
          };
        } catch (e) {
          console.log(e);
          throw new Error("unable_to_save");
        }
      }
    } catch (e) {
      return {
        path: this.repositoriesFilePath,
        filename: this.filename,
        operation: "save",
        error: e.message,
        success: false,
      };
    }
  }

  async deleteFromRepositoryFolder(): Promise<FileOperation> {
    try {
      if (!this.repositoriesPath) {
        throw new Error("repositories_path_not_set");
      }

      try {
        await unlink(this.repositoriesFilePath);
      } catch (e) {
        throw new Error("unable_to_delete");
      }

      return {
        path: this.repositoriesFilePath,
        filename: this.filename,
        operation: "delete",
        success: true,
      };
    } catch (e) {
      return {
        path: this.repositoriesFilePath,
        filename: this.filename,
        operation: "delete",
        error: e.message,
        success: false,
      };
    }
  }

  removeNodeFolder() {
    return rmdir(this.nodePath, { recursive: true });
  }

  // Change filename.txt to filename(1).txt
  incrementCopyNumber(): void {
    let filenameBase = getFilenameBase(this.filename);

    if (this.hasCopyNumber(filenameBase)) {
      const int = parseInt(filenameBase[filenameBase.length - 2]);
      filenameBase = replaceStringIndexAt(
        filenameBase,
        filenameBase.length - 2,
        (int + 1).toString()
      );
      this.filename = filenameBase + "." + getExtension(this.filename);
    } else {
      this.filename =
        filenameBase +
        `(${Math.floor(Date.now() / 1000)}).` +
        getExtension(this.filename);
    }
  }

  hasCopyNumber(str: string): boolean {
    if (str.length <= 3) {
      return false;
    }
    if (str[str.length - 1] !== ")") {
      return false;
    }
    if (!isInteger(str[str.length - 2])) {
      return false;
    }
    if (str[str.length - 3] !== "(") {
      return false;
    }

    return true;
  }
}
