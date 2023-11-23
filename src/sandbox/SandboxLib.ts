import { Axios } from "axios";
import { WriteFileOptions } from "fs";
import {
  FileMetadata,
  SandboxLib as AbstractSandboxLib,
} from "wordparrot-types";

import { FileUtility } from "..";

export interface SandboxLib
  extends AbstractSandboxLib<Axios, FileMetadata, FileUtility> {}
