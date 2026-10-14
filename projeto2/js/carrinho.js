const produtosSelecionados = document.getElementById(
    "produtos-selecionados"
);

async function carregarCarrinho() {
    const clienteId = localStorage.getItem("id_cliente");

    if (!clienteId) {
        produtosSelecionados.innerHTML =
            "<p>Faça login para consultar seu carrinho.</p>";
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

        produtosSelecionados.innerHTML = "";

        if (produtos.length === 0) {
            produtosSelecionados.innerHTML =
                "<p>Seu carrinho está vazio.</p>";
            return;
        }

        produtos.forEach((produto) => {
            // Cartão do produto
            const item = document.createElement("div");
            item.classList.add("produto-carrinho");

            // Imagem
            const imagem = document.createElement("img");
            imagem.src = produto.imagem || "";
            imagem.alt = produto.nome || "Imagem do produto";
            imagem.width = 120;

            // Nome
            const nome = document.createElement("h2");
            nome.textContent = produto.nome;

            // Preço
            const valor = document.createElement("p");
            valor.textContent = "R$ " + produto.valor;

            // Botão de excluir
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

                    alert(dados.mensagem);

                    // Atualiza o carrinho
                    carregarCarrinho();

                } catch (erro) {
                    console.error("Erro ao excluir produto:", erro);

                    alert(
                        erro.message ||
                        "Não foi possível excluir o produto."
                    );
                }
            });

            // Adiciona os elementos ao cartão
            item.appendChild(imagem);
            item.appendChild(nome);
            item.appendChild(valor);
            item.appendChild(botaoExcluir);

            // Mostra o cartão na página
            produtosSelecionados.appendChild(item);
        });

    } catch (erro) {
        console.error("Erro ao carregar carrinho:", erro);

        produtosSelecionados.innerHTML =
            "<p>Não foi possível carregar os produtos.</p>";
    }
}

carregarCarrinho();