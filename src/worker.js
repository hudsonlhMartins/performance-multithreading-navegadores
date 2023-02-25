import {Service} from './service.js'
const service = new Service()

console.log("i'm alive!")
postMessage({eventType: 'alive'})
onmessage = ({data})=>{
    const {query, file} = data 
    service.processFile({
        query: query,
        file,
        /*
            quem vai executar e passar esse args e o service como ele__
            recebe essa function ele executar ela passando esse params
        */
        onOcurrenceUpdate: (args)=>{
            postMessage({eventType: 'ocurrenceUpdate', ...args})
        },
        /*
            e no service vamos consumir isso sob demanda entap quando tive um pedaco__
            vamos chamar essa function ela ja vai ser executar quando tive outro pedaco__
            chamar ela tbm e ela vai emitir outro evento...
        */
        onProgress: (total)=>  postMessage({eventType: 'progress', total})

    })
}