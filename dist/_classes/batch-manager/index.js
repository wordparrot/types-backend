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
exports.BatchManager = void 0;
class BatchManager {
    constructor(config) {
        this.resultsArray = [];
        this.startingIndex = 0;
        this.batchItems = config.batchItems;
        this.batchSize = config.batchSize;
        this.stopOnFailure = config.stopOnFailure;
        this.allowEmpty = config.allowEmpty || false;
        this.maxIterations = config.maxIterations;
        if (!(config === null || config === void 0 ? void 0 : config.defaultHandler)) {
            throw new Error("Batch Manager: default handler must be provided");
        }
        this.defaultHandler = config.defaultHandler;
        if (config.startingIndex && (config === null || config === void 0 ? void 0 : config.startingIndex) > 0) {
            this.startingIndex = config.startingIndex;
        }
    }
    load(moreBatchItems) {
        this.batchItems = [...this.batchItems, ...moreBatchItems];
    }
    setStartingIndex(index) {
        this.startingIndex = index;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(this.batchItems)) {
                throw new Error("Batch Manager: batches are not in array format");
            }
            if (!Number.isInteger(this.batchSize) || this.batchSize <= 0) {
                throw new Error("Batch Manager: must provide valid batchSize");
            }
            if (this.batchItems.length === 0 && !this.allowEmpty) {
                throw new Error("Batch Manager: no items provided to manager");
            }
            if (this.batchItems.length < this.startingIndex) {
                throw new Error("Batch Manager: number of items is below starting index");
            }
            if (this.endingIndex && this.endingIndex <= this.startingIndex) {
                throw new Error("Batch Manager: ending index must be after startingIndex");
            }
            const results = yield this.execute();
            this.resultsArray.push(results);
            return results;
        });
    }
    execute() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const results = {
                numItems: this.batchItems.length,
                startingIndex: this.startingIndex,
                batchSize: this.batchSize,
                stopOnFailure: this.stopOnFailure,
                totalSuccess: 0,
                totalFailed: 0,
                totalUnsent: 0,
                success: [],
                failed: [],
                unsent: [],
            };
            if (!this.batchItems.length) {
                return results;
            }
            let shortCircuitLoop = false;
            const endingIndex = (_a = this.endingIndex) !== null && _a !== void 0 ? _a : this.batchItems.length;
            let numIterations = 0;
            for (let i = this.startingIndex; i < endingIndex; i += this.batchSize) {
                const remainder = this.batchItems.length - i;
                numIterations += 1;
                if (shortCircuitLoop) {
                    const unsentBatchItems = this.batchItems.slice(i);
                    results.totalUnsent += unsentBatchItems.length;
                    results.unsent.push(unsentBatchItems.map((batchItem, batchIndex) => {
                        const batchItemResponse = {
                            index: i + batchIndex,
                            batchItem,
                            response: null,
                            success: false,
                        };
                        return batchItemResponse;
                    }));
                }
                else if (remainder > 0 && remainder <= this.batchItems.length) {
                    const requests = this.batchItems.slice(i, i + this.batchSize);
                    try {
                        const batchResponses = yield Promise.all(requests.map((batchItem, batchIndex) => __awaiter(this, void 0, void 0, function* () {
                            try {
                                let response;
                                if (typeof batchItem === "function") {
                                    response = yield batchItem();
                                }
                                else {
                                    response = yield this.defaultHandler(batchItem, i + batchIndex);
                                }
                                const batchItemResponse = {
                                    batchItem,
                                    index: i + batchIndex,
                                    response,
                                    success: true,
                                };
                                return batchItemResponse;
                            }
                            catch (e) {
                                const batchItemResponse = {
                                    batchItem,
                                    index: i + batchIndex,
                                    response: (e === null || e === void 0 ? void 0 : e.message) || "error",
                                    success: false,
                                };
                                return batchItemResponse;
                            }
                        })));
                        const succeeded = batchResponses.filter((obj) => obj.success === true);
                        const failed = batchResponses.filter((obj) => obj.success === false);
                        if (succeeded.length) {
                            results.totalSuccess += succeeded.length;
                            results.success.push(succeeded);
                        }
                        if (failed.length) {
                            results.totalFailed += failed.length;
                            results.failed.push(failed);
                        }
                        if (failed.length && this.stopOnFailure) {
                            shortCircuitLoop = true;
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                if (this.maxIterations && numIterations >= this.maxIterations) {
                    break;
                }
            }
            return results;
        });
    }
    mostRecentResult() {
        if (!this.resultsArray.length) {
            return null;
        }
        return this.resultsArray[this.resultsArray.length - 1];
    }
    allResults() {
        return this.resultsArray;
    }
    getSuccessValues(batchResults) {
        var _a, _b, _c, _d;
        if (!batchResults) {
            const mostRecent = this.mostRecentResult();
            return (((_b = (_a = mostRecent === null || mostRecent === void 0 ? void 0 : mostRecent.success) === null || _a === void 0 ? void 0 : _a.flat()) === null || _b === void 0 ? void 0 : _b.map((batchResponse) => batchResponse.response)) || []);
        }
        return (((_d = (_c = batchResults === null || batchResults === void 0 ? void 0 : batchResults.success) === null || _c === void 0 ? void 0 : _c.flat()) === null || _d === void 0 ? void 0 : _d.map((batchResponse) => batchResponse.response)) || []);
    }
    getFailedValues(batchResults) {
        var _a, _b, _c, _d;
        if (!batchResults) {
            const mostRecent = this.mostRecentResult();
            return (((_b = (_a = mostRecent === null || mostRecent === void 0 ? void 0 : mostRecent.failed) === null || _a === void 0 ? void 0 : _a.flat()) === null || _b === void 0 ? void 0 : _b.map((batchResponse) => batchResponse.response)) || []);
        }
        return (((_d = (_c = batchResults === null || batchResults === void 0 ? void 0 : batchResults.failed) === null || _c === void 0 ? void 0 : _c.flat()) === null || _d === void 0 ? void 0 : _d.map((batchResponse) => batchResponse.response)) || []);
    }
    getUnsentValues(batchResults) {
        var _a, _b, _c, _d;
        if (!batchResults) {
            const mostRecent = this.mostRecentResult();
            return (((_b = (_a = mostRecent === null || mostRecent === void 0 ? void 0 : mostRecent.unsent) === null || _a === void 0 ? void 0 : _a.flat()) === null || _b === void 0 ? void 0 : _b.map((batchResponse) => batchResponse.response)) || []);
        }
        return (((_d = (_c = batchResults === null || batchResults === void 0 ? void 0 : batchResults.unsent) === null || _c === void 0 ? void 0 : _c.flat()) === null || _d === void 0 ? void 0 : _d.map((batchResponse) => batchResponse.response)) || []);
    }
    hasFailed() {
        const mostRecent = this.mostRecentResult();
        if (!mostRecent) {
            return false;
        }
        return mostRecent.totalFailed > 0;
    }
    static combine(config) {
        const { batchResultsArray, startingIndex, batchSize, isSameProcess, stopOnFailure, } = config;
        const combinedResults = {
            numItems: 0,
            startingIndex,
            batchSize,
            stopOnFailure,
            totalSuccess: 0,
            totalFailed: 0,
            totalUnsent: 0,
            success: [],
            failed: [],
            unsent: [],
        };
        return batchResultsArray.reduce((accumulator, counter) => {
            if (isSameProcess) {
                combinedResults.numItems = counter.numItems;
            }
            else {
                combinedResults.numItems += counter.numItems;
            }
            combinedResults.totalSuccess += counter.totalSuccess;
            combinedResults.totalFailed += counter.totalFailed;
            combinedResults.totalUnsent += counter.totalUnsent;
            combinedResults.success = [
                ...combinedResults.success,
                ...counter.success,
            ];
            combinedResults.failed = [...combinedResults.failed, ...counter.failed];
            combinedResults.unsent = [...combinedResults.unsent, ...counter.unsent];
            return accumulator;
        }, combinedResults);
    }
    static indexExceedsItems(batchResults, index) {
        const remainder = batchResults.numItems % batchResults.batchSize;
        if (remainder > 0) {
            return (batchResults.numItems <=
                batchResults.batchSize + batchResults.batchSize * (index + 1));
        }
        return (batchResults.numItems <=
            batchResults.batchSize + batchResults.batchSize * index);
    }
    static hasFinished(batchResults, index) {
        const results = batchResults;
        if (!results) {
            throw new Error("Batch manager: results have not been provided.");
        }
        if (this.indexExceedsItems(results, index)) {
            return true;
        }
        if (results.numItems === 0) {
            return true;
        }
        return (results.totalSuccess + results.totalFailed + results.totalUnsent >=
            results.numItems);
    }
}
exports.BatchManager = BatchManager;
