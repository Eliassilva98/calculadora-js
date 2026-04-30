const display = document.querySelector(".displayInput");
const buttons = document.querySelector(".keys");

const estadoCalculadora = {
  displayValor: "0",
  primeiroValor: null,
  operador: null,
  esperandoSegundoValor: false,
};

function atualizDisplay() {
  display.value = estadoCalculadora.displayValor;
}

function paraNumero(value) {
  return Number(value);
}

function formatarResultado(value) {
  const arredondado = Math.round((value + Number.EPSILON) * 1e10) / 1e10;

  return String(arredondado);
}

function inputNumero(num) {
  if (estadoCalculadora.esperandoSegundoValor) {
    estadoCalculadora.displayValor = num;
    estadoCalculadora.esperandoSegundoValor = false;
    return;
  }
  estadoCalculadora.displayValor =
    estadoCalculadora.displayValor === "0"
      ? num
      : estadoCalculadora.displayValor + num;
}

function inputDecimal() {
  if (estadoCalculadora.esperandoSegundoValor) {
    estadoCalculadora.displayValor = "0.";
    estadoCalculadora.esperandoSegundoValor = false;
    return;
  }
  if (!estadoCalculadora.displayValor.includes(".")) {
    estadoCalculadora.displayValor += ".";
  }
}

function limparTudo() {
  estadoCalculadora.displayValor = "0";
  estadoCalculadora.primeiroValor = null;
  estadoCalculadora.operador = null;
  estadoCalculadora.esperandoSegundoValor = false;
}

function retroceder() {
  if (estadoCalculadora.esperandoSegundoValor) return;

  if (estadoCalculadora.displayValor.length === 1) {
    estadoCalculadora.displayValor = "0";
  } else {
    estadoCalculadora.displayValor = estadoCalculadora.displayValor.slice(
      0,
      -1,
    );
  }

  atualizDisplay();
}

function porCentagem() {
  const atual = paraNumero(estadoCalculadora.displayValor);

  if (
    estadoCalculadora.primeiroValor === null ||
    estadoCalculadora.operador === null
  ) {
    estadoCalculadora.displayValor = formatarResultado(atual / 100);
    return;
  }

  const base = estadoCalculadora.primeiroValor;

  const porCentoValor = base * (atual / 100);

  estadoCalculadora.displayValor = formatarResultado(porCentoValor);
}

function calcular(primeiro, segundo, operador) {
  if (operador === "+") return primeiro + segundo;
  if (operador === "-") return primeiro - segundo;
  if (operador === "*") return primeiro * segundo;

  if (operador === "/") return segundo === 0 ? NaN : primeiro / segundo;
  return segundo;
}

function tratarOperador(proximoOperador) {
  const valorAtual = paraNumero(estadoCalculadora.displayValor);

  if (estadoCalculadora.operador && estadoCalculadora.esperandoSegundoValor) {
    estadoCalculadora.operador = proximoOperador;
    return;
  }

  if (estadoCalculadora.primeiroValor === null) {
    estadoCalculadora.primeiroValor = valorAtual;
  } else if (estadoCalculadora.operador) {
    const resultado = calcular(
      estadoCalculadora.primeiroValor,
      valorAtual,
      estadoCalculadora.operador,
    );

    estadoCalculadora.displayValor = formatarResultado(resultado);
    estadoCalculadora.primeiroValor = resultado;
  }
  estadoCalculadora.operador = proximoOperador;

  estadoCalculadora.esperandoSegundoValor = true;
}

function identificadorIgual() {
  if (!estadoCalculadora.operador || estadoCalculadora.primeiroValor === null)
    return;

  const segundoValor = paraNumero(estadoCalculadora.displayValor);
  const resultado = calcular(
    estadoCalculadora.primeiroValor,
    segundoValor,
    estadoCalculadora.operador,
  );

  if (!Number.isFinite(resultado)) {
    estadoCalculadora.displayValor = "Erro";
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

buttons.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;

  if (action === "number") {
    inputNumero(btn.dataset.number);
    atualizDisplay();
    return;
  }

  if (action === "decimal") {
    inputDecimal();
    atualizDisplay();
    return;
  }

  if (action === "operator") {
    tratarOperador(btn.dataset.operator);
    atualizDisplay();
    return;
  }

  if (action === "clear") {
    limparTudo();
    atualizDisplay();
    return;
  }

  if (action === "backspace") {
    retroceder();
    atualizDisplay();
    return;
  }

  if (action === "percent") {
    porCentagem();
    atualizDisplay();
    return;
  }

  if (action === "equals") {
    identificadorIgual();
    atualizDisplay();
    return;
  }
});

atualizDisplay();

document.addEventListener("keydown", (e) => {
  const k = e.key;

  if (/^[0-9]$/.test(k)) {
    inputNumero(k);
    atualizDisplay();
    return;
  }

  if (k === "." || k === ",") {
    inputDecimal();
    atualizDisplay();
    return;
  }

  if (k === "+" || k === "-" || k === "*" || k === "/") {
    tratarOperador(k);
    atualizDisplay();
    return;
  }

  if (k === "Enter" || k === "=") {
    e.preventDefault();
    identificadorIgual();
    atualizDisplay();
    return;
  }

  if (k === "Backspace") {
    retroceder();
    return;
  }

  if (k === "Escape" || k === "c" || k === "C") {
    limparTudo();
    return;
  }

  if (k === "%") {
    porCentagem();
    atualizDisplay();
    return;
  }
});
