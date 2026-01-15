/* Pegando elementos */
const display = document.querySelector('.displayInput');
const buttons = document.querySelector('.keys');

/* Estado da calculadora */
const estadoCalculadora = {
    displayValor: '0',               // guarda o valor que ta aparecendo no display
    primeiroValor: null,            // guarda o primeiro número da conta
    operador: null,                // guarda o operador matemático escolhido pelo usuário
    esperandoSegundoValor: false  // um controle lógico que diz se a calculadora está esperando o segundo valor ou ainda digitando o primeiro
}

/* Funções Uteis */
function atualizDisplay() {
    // valor do display / atualiza o display com o valor mais recente da calculadora
    display.value = estadoCalculadora.displayValor;

}

// Converte string segura para número (evita NaN)
function paraNumero(value) {  // <- recebe um parametro chamado value '1', '2.5', '0', '0.75'
    return Number(value);    // <- transforma o valor em número e retorna
}

function formatarResultado(value) { // <- value é o resultado da conta
    // Evita números enormes/bugados e remove .000000

   const arredondado = Math.round((value + Number.EPSILON) * 1e10) / 1e10;  // EPSILON é um número muito pequeno e serve para evitar erros de arredondamento
   // Math.round arredonda para o número mais próximo
  // value + Number.EPSILON pega o valor e dá esse ajuste pequeno

   return String(arredondado);  // <- Converte o resultado arredondado para string
}

/* Inserir número no display */
function inputNumero(num) {
    // num é o digito que o usuário clicou
    if (estadoCalculadora.esperandoSegundoValor) {
    // Começou a digitar o segundo numero
        estadoCalculadora.displayValor = num;
        estadoCalculadora.esperandoSegundoValor = false;
        return;
    }
    // Se estiver '0', substitui, se não concatena
    estadoCalculadora.displayValor = estadoCalculadora.displayValor === '0'
    ? num
    : estadoCalculadora.displayValor + num;
}

/* Inserir decimal */
function inputDecimal() {
    // verifica se a calculadora está esperando o segundo número
    if (estadoCalculadora.esperandoSegundoValor) {
        // Se estava esperando o segundo número e você clicou no decimal, a função coloca no visor: '0.'
        estadoCalculadora.displayValor = '0.';
        estadoCalculadora.esperandoSegundoValor = false;
        return;
    }

    // Agora vem a regra para quando você não está começando o segundo número.
    // Essa linha pergunta:
    // “O valor no visor NÃO tem ponto ainda?”
    // includes(".") retorna true se tiver "." dentro da string.
    // O ! inverte:
    // se tiver ponto → includes é true → !true vira false → não entra
    // se não tiver ponto → includes é false → !false vira true → entra
    // Isso evita 12.3.4 (não deixa colocar outro ponto).
    if (!estadoCalculadora.displayValor.includes('.')) {
        estadoCalculadora.displayValor += '.';
    }
}

/* Limpar tudo */
function limparTudo() {
    estadoCalculadora.displayValor = '0';                  // Coloca o visor de volta no valor inicial: '0'
    estadoCalculadora.primeiroValor = null;               // Apaga o “primeiro número” que a calculadora tinha guardado.
    estadoCalculadora.operador = null;                   // Apaga o operador que estava escolhido (+, -, *, /).
    estadoCalculadora.esperandoSegundoValor = false;    // Desliga o modo “esperando o segundo número”.
}

/* Backspace (⌫) */
// Ela não recebe parâmetros porque ela sempre age em cima do estado atual (estadoCalculadora.displayValor).
function retroceder() {
    // Se estiver esperando o segundo número → sai da função e não apaga nada.
    if (estadoCalculadora.esperandoSegundoValor) return; // não deixa apagar “vazio” no meio do operador

    // Agora ele verifica quantos caracteres tem no visor.
    if (estadoCalculadora.displayValor.length === 1) {
        // Se tinha só 1 caractere e voce apagou, não pode ficar vazio então ele define o visor como '0'
        estadoCalculadora.displayValor = '0';
    } else {
        // Se não tinha só 1 caractere, então dá pra apagar só o último dígito normalmente
        estadoCalculadora.displayValor = estadoCalculadora.displayValor.slice(0, -1);
    }

    atualizDisplay();
}

/* Por cento */
// Aqui vamos fazer o comportamento comum:
// - Se não tem operador: 50 -> 0.5
// - Se tem operador e firstValue: 200 + 10% => 200 + 20
function porCentagem() {
    // Pega o que tá no visor que normalmente é string '10', '2' e converte para número
    const atual = paraNumero(estadoCalculadora.displayValor);
    
    // significa que ainda não tem “primeiro número salvo” | significa que ainda não escolheu operador (+ - * /)
    // se qualquer uma dessas for verdadeira, entra no if
    if (estadoCalculadora.primeiroValor === null || estadoCalculadora.operador === null) {

        // Aqui ele divide o número atual por 100 passa pela função formatarResultado, salva de volta no visor
        estadoCalculadora.displayValor = formatarResultado(atual / 100);
        return;
    }

    // transforma em porcentagem do primeiroValor
    // Guarda o primeiro número da operação (o “valor base”) numa variável base
    const base = estadoCalculadora.primeiroValor;

    // transforma o número digitado em “percentual” e calcula X% de base
    const porCentoValor = base * (atual / 100);

    // Formata o resultado e coloca no visor
    estadoCalculadora.displayValor = formatarResultado(porCentoValor);
}

/* Cálculo principal */
function calcular(primeiro, segundo, operador) {
    if (operador === '+') return primeiro + segundo;
    if (operador === '-') return primeiro - segundo;
    if (operador === '*') return primeiro * segundo;

    // Aqui o if não deixa dividir por 0, Porque dividir por zero não faz sentido como resultado “normal” na calculadora
    // calcular(10, 2, "/") → 5
    // calcular(10, 0, "/") → NaN
    // NaN = “Not a Number” (não é número)
    if (operador === '/') return segundo === 0 ? NaN : primeiro / segundo;
    return segundo;
}

/* Tratar Operador */
// é a função que roda quando voce clica em + / − / × / ÷.
// guardar o primeiro número
// guardar / trocar o operador
// decidir quando calcular uma “conta parcial” (quando você encadeia operações, tipo 5 + 3 + 2)
// preparar a calculadora para receber o segundo número (esperandoSegundoValor = true)

function tratarOperador(proximoOperador) {
    // função que recebe proximo operadorquee o usuario acabou de clicar

    // pega o valor que está no visor que é string e converte para número
    const valorAtual = paraNumero(estadoCalculadora.displayValor);

   // voce digitou 8, clicou +, e antes de digitar o segundo número, clicou - (mudou de ideia).
   if (estadoCalculadora.operador && estadoCalculadora.esperandoSegundoValor) {
       estadoCalculadora.operador = proximoOperador;
       return;
   }

   // Primeiro operador: guarda o primeiroValor
   if (estadoCalculadora.primeiroValor === null) {
       estadoCalculadora.primeiroValor = valorAtual;

   } else if (estadoCalculadora.operador){

       // é o que permite fazer contas “em sequência” sem apertar = a cada passo.
       const resultado = calcular(estadoCalculadora.primeiroValor, valorAtual, estadoCalculadora.operador);

       estadoCalculadora.displayValor = formatarResultado(resultado);
       estadoCalculadora.primeiroValor = resultado;
   }
       // Define qual é o operador atual (o que você clicou agora).
       estadoCalculadora.operador = proximoOperador;
      
       estadoCalculadora.esperandoSegundoValor = true;
        //Sinaliza:
       // “Agora eu estou esperando o usuário digitar o próximo número (segundo número da próxima operação).”
}

/* Igual (=) */
function identificadorIgual() {
    if (!estadoCalculadora.operador || estadoCalculadora.primeiroValor === null) return;

    const segundoValor = paraNumero(estadoCalculadora.displayValor);
    const resultado = calcular(estadoCalculadora.primeiroValor, segundoValor, estadoCalculadora.operador);

    // divisão por zero ou NaN
    if (!Number.isFinite(resultado)) {
        estadoCalculadora.displayValor = 'Erro';
        estadoCalculadora.primeiroValor = null;
        estadoCalculadora.operador = null;
        estadoCalculadora.esperandoSegundoValor = false;
        return;
    }

    estadoCalculadora.displayValor = formatarResultado(resultado);
    estadoCalculadora.primeiroValor = null;
    estadoCalculadora.operador = null;
    estadoCalculadora.esperandoSegundoValor = false;
}

/* Evento de Cliques nos Botões */

buttons.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;

    // Números
    if (action === 'number') {
        inputNumero(btn.dataset.number);
        atualizDisplay();
        return;
    }

    // Decimal
    if (action === 'decimal') {
        inputDecimal();
        atualizDisplay();
        return;
    }

    // Operadores
    if (action === 'operator') {
        tratarOperador(btn.dataset.operator)
        atualizDisplay();
        return;
    }

    // Ações
    if (action === 'clear') {
        limparTudo();
        atualizDisplay();
        return;
    }

    if (action === 'backspace') {
        retroceder();
        atualizDisplay();
        return;
    }

    if (action === 'percent') {
        porCentagem();
        atualizDisplay();
        return;
    }

    if (action === 'equals') {
        identificadorIgual();
        atualizDisplay();
        return;
    }
});

atualizDisplay();

// Suporte por teclado (Teclas fisicas)
document.addEventListener('keydown', (e) => {
    const k = e.key;

    // Números
    if (/^[0-9]$/.test(k)) {
        inputNumero(k);
        atualizDisplay();
        return;
    }

    // Decimal
    if (k === '.' || k === ',') {
        inputDecimal();
        atualizDisplay();
        return;
    }

    // Operadores
    if (k === '+' || k === '-' || k === '*' || k === '/') {
        tratarOperador(k);
        atualizDisplay();
        return;
    }
    
    // Igual (Enter ou = )
    if (k === 'Enter' || k === '=') {
        e.preventDefault();
        identificadorIgual();
        atualizDisplay();
        return;
    }

    // Backspace
    if (k === 'Backspace') {
        retroceder();
        return;
    }

    // Limpar (Escape ou c/C)
    if (k === 'Escape' || k === 'c' || k === 'C') {
        limparTudo();
        return;
    }

    // Porcentagem
    if (k === '%') {
        porCentagem();
        atualizDisplay();
        return;
    }
});