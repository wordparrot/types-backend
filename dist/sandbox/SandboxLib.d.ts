/// <reference types="node" />
import { Axios } from "axios";
import { WriteFileOptions } from "fs";
import { FileUtilityConfig, SandboxLib as AbstractSandboxLib } from "wordparrot-types";
import { FileUtility } from "..";
export interface SandboxLib extends AbstractSandboxLib<Axios, FileUtilityConfig<WriteFileOptions>, FileUtility> {
}
