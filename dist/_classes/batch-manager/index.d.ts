export declare class BatchManager<BatchItem = any, BatchItemReturnValue = any> {
    private batchItems;
    private batchSize;
    private stopOnFailure;
    private allowEmpty;
    private resultsArray;
    private startingIndex;
    private endingIndex?;
    private maxIterations?;
    private defaultHandler;
    constructor(config: BatchManagerConfig<BatchItem, BatchItemReturnValue>);
    load(moreBatchItems: BatchItem[]): void;
    setStartingIndex(index: number): void;
    run(): Promise<BatchResults<BatchItem>>;
    private execute;
    mostRecentResult(): BatchResults<BatchItem> | null;
    allResults(): BatchResults<BatchItem>[];
    getSuccessValues(batchResults?: BatchResults): BatchItemReturnValue[];
    getFailedValues(batchResults?: BatchResults): BatchItemReturnValue[];
    getUnsentValues(batchResults?: BatchResults): BatchItemReturnValue[];
    hasFailed(): boolean;
    static combine(config: {
        batchResultsArray: BatchResults[];
        startingIndex: number;
        batchSize: number;
        stopOnFailure: boolean;
        isSameProcess: boolean;
    }): BatchResults;
    static indexExceedsItems(batchResults: BatchResults, index: number): boolean;
    static hasFinished(batchResults: BatchResults, index: number): boolean;
}
export interface BatchItemResponse<BatchItem = any> {
    index: number;
    batchItem: BatchItem;
    response: any;
    success: boolean;
}
export interface BatchResults<BatchItem = any> {
    numItems: number;
    startingIndex: number;
    batchSize: number;
    stopOnFailure: boolean;
    totalSuccess: number;
    totalFailed: number;
    totalUnsent: number;
    success: BatchItemResponse<BatchItem>[][];
    failed: BatchItemResponse<BatchItem>[][];
    unsent: BatchItemResponse<BatchItem>[][];
}
interface BatchManagerConfig<BatchItem, BatchItemReturnValue> {
    batchItems: BatchItem[];
    batchSize: number;
    stopOnFailure: boolean;
    allowEmpty?: boolean;
    startingIndex?: number;
    maxIterations?: number;
    defaultHandler: (batch: BatchItem, index: number) => Promise<BatchItemReturnValue>;
}
export {};
