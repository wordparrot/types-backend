import BatchManager from './src/_classes/batch-manager'

const manager = new BatchManager<number, number>({
    batchItems: [...Array(10).keys()],
    batchSize: 2,
    startingIndex: 2,
    defaultHandler: (batchItem) => {
        if (batchItem == 7) {
            throw new Error('Cant allow 7')
        }

        return Promise.resolve(batchItem)
    },
    stopOnError: true,
});

(async () => {
    await manager.run()
    console.log(manager.mostRecentResult())
})()
