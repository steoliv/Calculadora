class CalcController {

    constructor(){ // o constructor é executado automaticamente

        this._audio = new Audio('click.mp3');
        this._audioOnOff = false; //Audio inicia desligado
        this._lastOperation = ''; // Ultimo operador
        this._lastNumber = '';// ultimo numero

        this._operation = []; //Array para popular as operações
        this._locale = 'pt-br'; // atributo criado para armazanar o idioma
        this._displayCalcEl = document.querySelector("#display"); // Refere-se ao elemento no DOM
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate; // data atual
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();
    }


    //Método para Copiar da area de transferencia 
    pasteFromClipboard(){

            document.addEventListener('paste', e=>{

               let text =  e.clipboardData.getData('Text');

               this.displayCalc = parseFloat(text);

               console.log(text);
            })
    }


    // método para copiar para area de tranferencia
    copyToClipBoard(){

        let input = document.createElement('input');// criando um input  no html

        input.value = this.displayCalc;

        document.body.appendChild(input); // inserindo input no body para que possa ser selecionado

        input.select(); // criando select

        document.execCommand("Copy"); // copiando o que está no select

        input.remove(); // removendo input após a seleção
    }

    //método principal, tudo que que quero que aconteça na calculadora vai conter nele
    initialize(){

        this.setDisplayDateTime();

        setInterval(()=>{ // Arrow Function -> Um novo recurso para criação de funções
            
            this.setDisplayDateTime();

        }, 1000);    

        this.setLastNumberToDisplay();

        this.pasteFromClipboard();


        //evento de duplo click no btn ac para ativar/desativar o som
        document.querySelectorAll('.btn-ac').forEach(btn=>{

            btn.addEventListener('dblclick', e=>{
                 
                this.toggleAudio();
              

            });

        });

    }    

    //Método para por som 
    toggleAudio(){

        this._audioOnOff = !this._audioOnOff;
        console.log('entrou no metodo toggle');
    
    }

    playAudio(){

        if (this._audioOnOff) {

            this._audio.currentTime = 0;
            this._audio.play();

        }

    }

    // metodo para capturar eventos do teclado
    initKeyboard(){

        
        document.addEventListener('keyup', e=>{

            this.playAudio();

            switch(e.key){
                case 'Escape' :
                    this.clearAll();
                    break;
    
                case 'Backspace' :
                    this.clearEntry();
                    break;
                
                case '+':
                case '-' :
                case '*' :
                case '/' :
                case '%' :
                  this.addOperation(e.key);
                  break;
                
                case 'Enter' :
                case '=' :
                    this.calc();
                    break;

                case '.' :
                case ',' :
                    this.addDot('.');
                    break;
    
                case '0':
                case '1':
                case '2': 
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c' :
                    if(e.ctrlKey) this.copyToClipBoard();
                    break;

            }
        });
    }


    // Metodo para adicionar mais de um evento nos botões (click, drag, mouseover...) para usar no método initButtonsEvents();
    addEventListenerAll(element, events, fn){

        events.split(' ').forEach(event => {

           element.addEventListener(event, fn, false); 

        });
    }

    //método para limpar tudo
    clearAll(){
    
        this._operation = [];
        this._lastNumber = '';
        this._lastOperation = '';

        this.setLastNumberToDisplay();
    
    }

    //Método para limpar a ultima entrada (ultima coisa digitada)
    clearEntry(){
    
        this._operation.pop(); // remove o último elemento do array
     
        this.setLastNumberToDisplay();

    }

    //metodo para pegar a última posição do array
    getLastOperation(){

        return this._operation[this._operation.length-1];
    
    }


    setLastOperation(value){
        // se o ultimo for um operador, troque-o
        this._operation[this._operation.length-1] = value;
    }


    // metodo para verificar operador
    isOperator(value){

        return (['+','-','*','/','%'].indexOf(value) > -1);

    }

    // metodo reponsavel por faver o push e depois verificar sem há 3 elementos no array
    pushOperation(value){

        this._operation.push(value); //push(); adiciona mais um elemento a um array

        if(this._operation.length > 3){

            this.calc();
        
        }

    }


     //o eval junta e o join tira a virgula do array
    getResult(){
        try {
            
            return eval(this._operation.join(""));
        
        }catch(e){
            setTimeout(()=>{

                this.setError();
                
            }, 1);


        }

    }


    calc(){

        let last = '';

        this._lastOperator = this.getLastItem();


        if(this._operation.length < 3){

            let firstItem = this._operation[0];

            this._operation = [firstItem, this._lastOperator, this._lastNumber];

        }

        if(this._operation.length > 3){

            last = this._operation.pop(); // retirar o ultimo operador e guardar na variavel

            this._lastNumber = this.getResult();

        
        }else if(this._operation.length == 3) {

            this._lastNumber =  this.getLastItem(false);

        }


        let result = this.getResult();
        
        //Tratando a operação do %

        if(last == '%'){

            result /= 100;

            this._operation = [result];

        }else{

            this._operation = [result];// Agora recebe o result e coloca em um novo array com o last
        
            if(last) this._operation.push(last);
        }

        this.setLastNumberToDisplay();
        
    }

    //
    getLastItem(isOperator = true) { // por padrão sempre trará o ultimo operador
        
        let lastItem;

        for(let i =  this._operation.length- 1; i >= 0;  i--){

            if(this.isOperator(this._operation[i]) == isOperator){
               
                lastItem = this._operation[i];

                break;
            }


        }
        
        if(!lastItem){

            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        
        }

        return lastItem;

    }


    //MOstre o ultimo numero no display, percorrendo o array de trás pra frente
    setLastNumberToDisplay(){

        let lastNumber = this.getLastItem(false);

        if(!lastNumber) lastNumber = 0;

        // Exibir numero no display
        this.displayCalc = lastNumber;
    }



    //Médoto para adicionar uma operação
    addOperation(value){


        //verificando se o último elemento do array é um numero ou não. nesse caso usarei para verificar os sinais (+,-,.,/,*,...)
        if(isNaN(this.getLastOperation())){ 
            //Se for string
            if(this.isOperator(value)){
                // se o ultimo for um operador, troque-o
                this.setLastOperation(value);

            }else{

                this.pushOperation(value); //push(); adiciona mais um elemento a um array
                this.setLastNumberToDisplay();

            }

        }else{

            if(this.isOperator(value)){
                //se for operador
                this.pushOperation(value);

            }else{
   
                //Se for Numero
                let newValue = this.getLastOperation().toString() + value.toString();    //converte ultimo numero do array em uma strig e depois pega o value e convert tbm em string para conseguir concatenar 
                this.setLastOperation(newValue);

                this.setLastNumberToDisplay();
            
            }

        }
    
    }

    // metodo para exibir error no display
    setError(){
    
        this.displayCalc = "Erro";
    
    }

    addDot(){

        //pega a ultima operação
        let lastOperation =  this.getLastOperation();

        // verificar se a operação é uma string e se existir, se ja possue um ponto (.)
        if(typeof lastOperation ===  'string' && lastOperation.split('').indexOf('.') > -1 ) return;

        // Verificar se a ultima operaão é um sinal ou undefined, e olocar 0, se for
        if(this.isOperator(lastOperation) || !lastOperation){

            this.pushOperation('0.');

        }else{

            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();

    }

    //Metodo para executar os possiveis ações dos btns
    execBtn(value){

        this.playAudio();

        switch(value){
            case 'ac' :
                this.clearAll();
                break;

            case 'ce' :
                this.clearEntry();
                break;
            
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao' :
                this.addOperation('-');
                break

            case 'igual' :
                this.calc();
                break;

            case 'multiplicacao' :
                this.addOperation('*');
                break;

            case 'divisao' :
                this.addOperation('/');
                break;

            case 'porcento' :
                this.addOperation('%');
                break;

            case 'ponto' :
                this.addDot('.');
                break;

            case '0':
            case '1':
            case '2': 
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default :
                this.setError();
                break;
        }
    }


    //Método para Eventos dos botões
    initButtonsEvents(){

        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        //adicionando eventos
        buttons.forEach((btn, index)=>{

            this.addEventListenerAll(btn, "click drag", e => {

                //Renomeando nome das classes nos botões
                let textBtn = btn.className.baseVal.replace("btn-","");

                //Executando ação no btn
                this.execBtn(textBtn);

            });

            //MUdar cursor do mouse
            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
    
                btn.style.cursor = "pointer";
    
            })

        })

    }
    // metodo para Fazer com que a data e hora atualizam a cada segundo
    setDisplayDateTime(){

        this.displayDate = this.currentDate.toLocaleDateString(this._locale,{
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    
    }

    // Todoa vez que você criar um atributo private, seja no constructor ou em qualquer método, você precisa do get and set. Que é como as pessoas recuperam e como as pessoas atribuem valor
    //REcupera o valor
    get displayTime(){
    
        return this._timeEl.innerHTML; // propriedade que  pega o objeto que estou falando e atribui um novo valor -> O innerHTML pode ser usado para receber o conteúdo de um elemento HTML ou para definir um novo conteúdo para ele
    
    }
    //  Atribui valor
    set displayTime(value){
    
        return this._timeEl.innerHTML = value;
    
    }

    get displayDate(){
    
        return this._dateEl.innerHTML;
    
    }

    set displayDate(value){
    
        return this._dateEl.innerHTML = value;
    
    }

    //REcupera o valor do displayCalc 
    get displayCalc(){

        return this._displayCalcEl.innerHTML;
    
    }

    //  Atribui valor do dipleyCalcl
    set displayCalc(value){
        
        //se no displey tiver mais que 10 caracters, dê erro
        if(value.toString().length > 10 ){
            this.setError();
            return false;

        }
        this._displayCalcEl.innerHTML = value;

    }

    get currentDate(){

        return new Date();
    
    }

    set currentDate(value){

        this._currentDate = value;
    
    }
}

