export class Service{
    processFile({query, file, onOcurrenceUpdate, onProgress}){
 
        const lineLength = {counter: 0}
        const progressFn = this.#setupProgress(file.size, onProgress)
        const startAt = performance.now()
        const elapsed = () => `${((performance.now() - startAt) / 1000).toFixed(2)} secs`

        const onUpdate = ()=>{
            return (found)=>{
                onOcurrenceUpdate({
                    found,
                    took: elapsed(),
                    lineLength: lineLength.counter
                })
            }
        }

        file.stream()
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(this.#csvToJson({lineLength, progressFn}))
            .pipeTo(this.#findOnCurrencies({query, onOcurrenceUpdate: onUpdate()}))
            // .pipeTo(new WritableStream({
            //     write(chunk){
            //         console.log('chunk',chunk)
            //     }
            // }))
    }   

    #csvToJson({lineLength, progressFn}){
        let columns = []
        return new TransformStream({
            transform(chunk, controller){
                progressFn(chunk.length)
                const lines = chunk.split('\n')
                lineLength.counter+= lines.length

                if(!columns.length){
                    /*
                        isso aqui so para pegar a primeira linha que no caso que__
                        contem a info falando doque e o dado se uma cidade, o caso etc..
                        isso chamamos aqui de colunas e no cvs ele e a primeira linha
                    */
                    const firstLine = lines.shift()
                    columns = firstLine.split(';')
                    lineLength.counter--
                }

                for(const line of lines){
                    if(!line.length) continue
                    let currentItem = {}
                    const currentColumnsItems = line.split(';')
                    for(const columnIndex in currentColumnsItems){
                        const clumnItem =  currentColumnsItems[columnIndex]
                        currentItem[columns[columnIndex]] = clumnItem.trimEnd()
                    }
                
                    controller.enqueue(currentItem)
                }
            }
        })

    }

    #findOnCurrencies({query, onOcurrenceUpdate}){
        const queryKeys = Object.keys(query)
        let found = {}

        return new WritableStream({
            write(jsonLine){
                for(const keyIndex in queryKeys){
                    const key = queryKeys[keyIndex]
                    const queryValue = query[key]
                    found[queryValue] = found[queryValue] ?? 0
                    if(queryValue.test(jsonLine[key])){
                        found[queryValue]++
                        onOcurrenceUpdate(found)
                        
                    }
                }
            },
            close: () => onOcurrenceUpdate(found)
        })
    }

    #setupProgress (totalBytes, onProgress){
        let totalUpdate = 0
        onProgress(0)

        return (chunkLength)=>{
            totalUpdate +=chunkLength
            const total = Math.ceil(100 / totalBytes * totalUpdate)
            onProgress(total)
        }
    }
}