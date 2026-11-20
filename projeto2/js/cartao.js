
document.addEventListener("DOMContentLoaded", () => {
    const opcoesCartao = document.getElementById("opcoes-cartao");
    const campoTipoCartao = document.getElementById("tipoCartao");

    const formasPagamento = document.querySelectorAll(
        'input[name="pagamento"]'
    );

    function atualizarFormaPagamento() {
        const selecionado = document.querySelector(
            'input[name="pagamento"]:checked'
        );

        const usarCartao =
            selecionado && selecionado.value === "cartao";

        if (opcoesCartao) {
            opcoesCartao.hidden = !usarCartao;
        }

        if (campoTipoCartao) {
            campoTipoCartao.required = Boolean(usarCartao);

            if (!usarCartao) {
                campoTipoCartao.value = "";
            }
        }
    }

    formasPagamento.forEach((opcao) => {
        opcao.addEventListener("change", atualizarFormaPagamento);
    });

    atualizarFormaPagamento();

    // Valida a opção de cartão antes de continuar
    window.validarTipoCartao = function () {
        const selecionado = document.querySelector(
            'input[name="pagamento"]:checked'
        );

        if (!selecionado) {
            alert("Selecione uma forma de pagamento.");
            return false;
        }

        if (selecionado.value !== "cartao") {
            return true;
        }

        const tipo = campoTipoCartao?.value;

        if (!["credito", "debito"].includes(tipo)) {
            alert("Selecione cartão de crédito ou débito.");
            campoTipoCartao?.focus();
            return false;
        }

        return true;
    };
});
