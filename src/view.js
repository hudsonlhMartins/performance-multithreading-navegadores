export class View{
    #$ = document.querySelector.bind(document)
    #csvFile = this.#$('#csv-file')
    #fileSize = this.#$('#file-size')
    #form = this.#$('#form')
    #debug = this.#$('#debug')
    #progress = this.#$('#progress')
    #worker = this.#$('#worker')

    setFileSize(size){
        this.#fileSize.innerText = `File Size ${size}\n`
    }

    /*
        criamos o metado aqui e chamos elas la na controller e essa fn
        e uma function la da controller que quando chamos esses metado
         passamos um function para elas
    */
    configureOnfileChange(fn){
        this.#csvFile.addEventListener('change', e =>{

            fn(e.target.files[0])
        })
    }

    configureOnFormSubmit(fn){
        this.#form.reset()
        this.#form.addEventListener('submit', e =>{
            e.preventDefault()
            const file = this.#csvFile.files[0]
            if(!file){

                alert('you no selected a file')
                return
            }
            const form = new FormData(e.currentTarget)
            const desc = form.get('description')
            this.updateDebugLog('')
            fn({desc, file})
        })
    }

    updateDebugLog(text, reset = true){
        if(reset){
            this.#debug.innerText= text 
            return
        }
        this.#debug.innerText += text 

    }

    updateProgress(value){
        this.#progress.value = value

    }

    isWorkerEnabled(){
        return this.#worker.checked
    }
}