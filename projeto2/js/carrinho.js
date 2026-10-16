let carrinhoAtual = [];

const produtosSelecionados = document.getElementById(
    "produtos-selecionados"
);

async function carregarCarrinho() {
    const clienteId = localStorage.getItem("id_cliente");
    const elementoTotal = document.getElementById("valor-total");

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

        // Guarda os produtos para o cálculo e pagamento
        carrinhoAtual = produtos;
        produtosSelecionados.innerHTML = "";

        // Verifica se o carrinho está vazio
        if (produtos.length === 0) {
            produtosSelecionados.innerHTML =
                "<p>Seu carrinho está vazio.</p>";

            elementoTotal.textContent = "Total: R$ 0,00";
            return;
        }

        // Calcula o total
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

        // Exibe os produtos
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
                const confirmar = confirm(
                    `Deseja remover ${produto.nome} do carrinho?`
                );

                if (!confirmar) {
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

                    alert(dados.mensagem || "Produto removido do carrinho.");

                    // Recarrega a lista e recalcula o total
                    await carregarCarrinho();

                } catch (erro) {
                    console.error("Erro ao excluir produto:", erro);

                    alert(
                        erro.message ||
                        "Não foi possível excluir o produto."
                    );
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

// Evento de pagamento registrado apenas uma vez
const botaoPagar = document.querySelector(".CU");

if (botaoPagar) {
    botaoPagar.addEventListener("click", () => {
        const clienteId = localStorage.getItem("id_cliente");

        if (!clienteId) {
            alert("Faça login para realizar o pagamento!");
            return;
        }

        if (carrinhoAtual.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }

        const total = carrinhoAtual.reduce((soma, produto) => {
            return soma + (Number(produto.valor) || 0);
        }, 0);

        if (!Number.isFinite(total) || total <= 0) {
            alert("Não foi possível calcular o valor da compra.");
            return;
        }

        const valorFormatado = total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const confirmar = confirm(
            `CONFIRMAR COMPRA\n\n` +
            `Valor total: ${valorFormatado}\n\n` +
            `Deseja confirmar a compra?`
        );

        if (!confirmar) {
            return;
        }

        // Simulação: ainda não registra a compra no banco
        alert(
            `PAGAMENTO SIMULADO COM SUCESSO!\n\n` +
            `Valor total: ${valorFormatado}\n\n` +
            `Obrigado pela sua compra!`
        );
    });
}

carregarCarrinho();