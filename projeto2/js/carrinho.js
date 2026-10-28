
let carrinhoAtual = [];

const produtosSelecionados = document.getElementById(
    "produtos-selecionados"
);

const elementoTotal = document.getElementById("valor-total");
const botaoPagar = document.getElementById("botaoPagar");
const opcoesCartao = document.getElementById("opcoes-cartao");

const formasPagamento = document.querySelectorAll(
    'input[name="pagamento"]'
);

// MOSTRAR OU ESCONDER OPÇÕES DO CARTÃO
function atualizarFormaPagamento() {
    const selecionado = document.querySelector(
        'input[name="pagamento"]:checked'
    );

    if (opcoesCartao) {
        opcoesCartao.hidden =
            !selecionado || selecionado.value !== "cartao";
    }
}

formasPagamento.forEach((opcao) => {
    opcao.addEventListener("change", atualizarFormaPagamento);
});

atualizarFormaPagamento();

// CARREGAR CARRINHO
async function carregarCarrinho() {
    const clienteId = localStorage.getItem("id_cliente");

    if (!produtosSelecionados || !elementoTotal) {
        console.error("Elementos do carrinho não encontrados no HTML.");
        return;
    }

    if (!clienteId) {
        produtosSelecionados.innerHTML =
            "<p>Faça login para consultar seu carrinho.</p>";

        elementoTotal.textContent = "Total: R$ 0,00";
        carrinhoAtual = [];
        return;
    }

    try {
        const resposta = await fetch(
            `http://localhost:3000/carrinho/${clienteId}`
        );

        const produtos = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                produtos.mensagem || "Erro ao carregar carrinho."
            );
        }

        carrinhoAtual = produtos;
        produtosSelecionados.innerHTML = "";

        if (produtos.length === 0) {
            produtosSelecionados.innerHTML =
                "<p>Seu carrinho está vazio.</p>";

            elementoTotal.textContent = "Total: R$ 0,00";
            return;
        }

        const total = produtos.reduce((soma, produto) => {
            return soma + (Number(produto.valor) || 0);
        }, 0);

        elementoTotal.textContent = `Total: ${total.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        )}`;

        produtos.forEach((produto) => {
            const item = document.createElement("div");
            item.classList.add("produto-carrinho");

            const imagem = document.createElement("img");

            imagem.src = produto.imagem
                ? `../imagem/${produto.imagem.split("/").pop()}`
                : "";

            imagem.alt = produto.nome || "Imagem do produto";
            imagem.width = 120;
            imagem.height = 120;
            imagem.style.objectFit = "contain";

            const nome = document.createElement("h2");
            nome.textContent = produto.nome;

            const valor = document.createElement("p");
            valor.textContent = Number(produto.valor).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

            const botaoExcluir = document.createElement("button");
            botaoExcluir.textContent = "🗑️ Excluir";
            botaoExcluir.classList.add("botao-excluir");

            botaoExcluir.addEventListener("click", async () => {
                if (!confirm(
                    `Deseja remover ${produto.nome} do carrinho?`
                )) {
                    return;
                }

                try {
                    const respostaExcluir = await fetch(
                        `http://localhost:3000/carrinho/${produto.compra_id}`,
                        {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                cliente_id: Number(clienteId)
                            })
                        }
                    );

                    const dados = await respostaExcluir.json();

                    if (!respostaExcluir.ok) {
                        throw new Error(
                            dados.mensagem || "Erro ao excluir produto."
                        );
                    }

                    alert(
                        dados.mensagem ||
                        "Produto removido do carrinho."
                    );

                    await carregarCarrinho();

                } catch (erro) {
                    console.error("Erro ao excluir:", erro);
                    alert(erro.message || "Erro ao excluir produto.");
                }
            });

            item.appendChild(imagem);
            item.appendChild(nome);
            item.appendChild(valor);
            item.appendChild(botaoExcluir);

            produtosSelecionados.appendChild(item);
        });

    } catch (erro) {
        console.error("Erro ao carregar carrinho:", erro);

        produtosSelecionados.innerHTML =
            "<p>Não foi possível carregar os produtos.</p>";

        elementoTotal.textContent = "Total: R$ 0,00";
        carrinhoAtual = [];
    }
}

// FINALIZAR PAGAMENTO
if (botaoPagar) {
    botaoPagar.addEventListener("click", async () => {
        const clienteId = localStorage.getItem("id_cliente");

        if (!clienteId) {
            alert("Faça login para continuar.");
            return;
        }

        const selecionado = document.querySelector(
            'input[name="pagamento"]:checked'
        );

        if (!selecionado) {
            alert("Selecione Pix ou cartão.");
            return;
        }

        if (carrinhoAtual.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const forma = selecionado.value;
        let tipoCartao = null;

        if (forma === "cartao") {
            tipoCartao = document.getElementById("tipoCartao")?.value;

            if (!["credito", "debito"].includes(tipoCartao)) {
                alert("Selecione crédito ou débito.");
                return;
            }
        }

        const total = carrinhoAtual.reduce((soma, produto) => {
            return soma + (Number(produto.valor) || 0);
        }, 0);

        if (!Number.isFinite(total) || total <= 0) {
            alert("Valor da compra inválido.");
            return;
        }

        const nomeForma = forma === "pix"
            ? "Pix"
            : `Cartão de ${tipoCartao}`;

        const valorFormatado = total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        if (!confirm(
            `CONFIRMAR PEDIDO\n\n` +
            `Forma: ${nomeForma}\n` +
            `Total: ${valorFormatado}\n\n` +
            `Deseja continuar?`
        )) {
            return;
        }

        botaoPagar.disabled = true;

        try {
            const resposta = await fetch(
                "http://localhost:3000/pagamento",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        cliente_id: Number(clienteId),
                        forma_pagamento: forma,
                        tipo_cartao: tipoCartao
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || "Erro ao registrar o pagamento."
                );
            }

            alert(
                `Pedido registrado com sucesso!\n\n` +
                `Forma: ${nomeForma}\n` +
                `Total: ${Number(dados.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                })}\n` +
                `Status: ${dados.status}`
            );

            // Atualiza a exibição do carrinho
            await carregarCarrinho();

        } catch (erro) {
            console.error("Erro no pagamento:", erro);

            alert(
                erro.message ||
                "Não foi possível registrar o pagamento."
            );
        } finally {
            botaoPagar.disabled = false;
        }
    });
}

// INICIAR
carregarCarrinho();
