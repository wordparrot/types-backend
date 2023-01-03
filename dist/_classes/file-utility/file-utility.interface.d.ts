export interface FileOperation {
    path: string;
    filename: string;
    operation: string;
    success: boolean;
    error?: string;
}
