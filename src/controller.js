export class Controller{
    #view
    #worker
    #events = {
        alive:()=>{},
        progress:({total})=>{
            this.#view.updateProgress(total)
        },
        ocurrenceUpdate:({found,lineLength,took})=>{ 
           const [[key, value]] = Object.entries(found)
           this.#view.updateDebugLog(
           `found ${value} ocurrencies of ${key} -over ${lineLength} lines - took: ${took}`
           )
        }
    }
    constructor({view, worker}){
        this.#view = view
        this.#worker = this.#configureWorker(worker)
    }

    /*
        a gente chamar a class aqui dentro e quando usamos essa class vamos chamar o init
        que um metado static e passamos as deps para ele e aqui como instaciamos a class
        passamos as deps que o init mandou para a gente para o constructor dessa class
    */ 
    static init(deps){
        const controller = new Controller(deps)
        controller.init()
        return controller
    }

    init(){
        this.#view.configureOnfileChange(this.#configureInFileChange.bind(this))
        this.#view.configureOnFormSubmit(this.#configureOnFormSubmit.bind(this))

   
    }

    #configureWorker(worker){
        worker.onmessage = ({data})=>{
            // console.log('data',data)
            const event = data.eventType
            this.#events[event](data)
        }

        return worker
    }

    #formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB']
    
        let i = 0
    
        for (i; bytes >= 1024 && i < 4; i++) {
          bytes /= 1024
        }
    
        return `${bytes.toFixed(2)} ${units[i]}`
    }

    #configureInFileChange(file){
        this.#view.setFileSize(this.#formatBytes(file.size))
    }

    #configureOnFormSubmit({desc, file}){
        const query = {}
        query['NATUREZA'] = new RegExp(
            desc, 'i'
        )
        if(this.#view.isWorkerEnabled()){
            console.log('executing on worker thread!')
            /*
                quando damos esse post ele vai para o file worker.js
                estou mando ele para o onmessage que esta no woker.js
                e la nesse onmessage eu chamos outro postMessage para manda as info__
                pra o configureWorker aqui que tem o onmessage
            */ 
            this.#worker.postMessage({query, file}) // aqui estou enviando para o woker.js

            return
        }
        console.log('executing on main thread!')

    }
}