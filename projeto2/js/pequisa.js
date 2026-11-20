const campoProduto = document.getElementById("prod");
const resultado = document.getElementById("resultado-pesquisa");

async function produstos_de_pesquisa() {
    const pesquisa = campoProduto.value.trim();

    resultado.innerHTML = "";

    if (pesquisa === "") {
        return;
    }

    try {
        const resposta = await fetch(
            `http://localhost:3000/produtos?pesquisa=${encodeURIComponent(pesquisa)}`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao buscar produtos.");
        }

        const produtos = await resposta.json();

        if (produtos.length === 0) {
            resultado.textContent = "Nenhum produto encontrado.";
            return;
        }

        produtos.forEach((produto) => {
            const item = document.createElement("p");

            item.textContent = produto.nome;
            item.style.cursor = "pointer";

            item.addEventListener("click", () => {
                if (!produto.pagina) {
                    alert("Este produto ainda não tem uma página cadastrada.");
                    return;
                }

                window.location.href = produto.pagina;
            });

            resultado.appendChild(item);
        });

    } catch (erro) {
        console.error("Erro na pesquisa:", erro);
        resultado.textContent =
            "Não foi possível buscar os produtos.";
    }
}

if (campoProduto && resultado) {
    campoProduto.addEventListener("input", produstos_de_pesquisa);

    campoProduto.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            produstos_de_pesquisa();
        }
    });
}
