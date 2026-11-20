document.addEventListener("DOMContentLoaded", () => {
    const botaoCarrinho = document.getElementById("adicionarCarrinho");

    if (!botaoCarrinho) return;

    botaoCarrinho.addEventListener("click", async () => {
        const clienteId = localStorage.getItem("id_cliente");
        const produtoId = document.body.dataset.produtoId;

        if (!clienteId) {
            alert("Faça login antes de adicionar produtos ao carrinho.");
            window.location.href = "conta.html";
            return;
        }

        if (!produtoId) {
            alert("Não foi possível identificar o produto.");
            return;
        }

        botaoCarrinho.disabled = true;

        try {
            const resposta = await fetch("http://localhost:3000/carrinho", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cliente_id: clienteId,
                    produto_id: produtoId
                })
            });

            const dados = await resposta.json();

            alert(dados.mensagem);

            if (resposta.ok) {
                console.log("Produto registrado no carrinho.");
            }

        } catch (erro) {
            console.error("Erro no carrinho:", erro);
            alert("Não foi possível conectar ao servidor.");
        } finally {
            botaoCarrinho.disabled = false;
        }
    });
});
